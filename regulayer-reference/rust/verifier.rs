//! Regulayer Reference Verifier (Rust)
//!
//! CLEAN-ROOM IMPLEMENTATION
//! This verifier shares NO code with Regulayer production systems.
//! It exists solely to prove that verification is reproducible by anyone.
//!
//! Usage:
//!     cargo run --release -- bundle.json [public_key_base64]

use std::collections::BTreeMap;
use std::env;
use std::fs;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};

// ============================================================
// Data Structures
// ============================================================

#[derive(Debug, Serialize, Deserialize)]
struct ProofBundle {
    schema_version: Option<String>,
    bundle_id: Option<String>,
    decision: Value,
    attestation: Value,
    chain_position: Value,
    verification: Value,
}

#[derive(Debug, Serialize)]
struct VerificationCheck {
    name: String,
    passed: bool,
    message: String,
}

#[derive(Debug, Serialize)]
struct VerificationResult {
    valid: bool,
    checks: Vec<VerificationCheck>,
    verified_at: String,
}

impl VerificationResult {
    fn new() -> Self {
        Self {
            valid: true,
            checks: Vec::new(),
            verified_at: chrono::Utc::now().to_rfc3339(),
        }
    }

    fn add_check(&mut self, name: &str, passed: bool, message: &str) {
        self.checks.push(VerificationCheck {
            name: name.to_string(),
            passed,
            message: message.to_string(),
        });
        if !passed {
            self.valid = false;
        }
    }
}

// ============================================================
// Canonicalization (RFC 8785)
// ============================================================

fn canonicalize_json(value: &Value) -> String {
    match value {
        Value::Null => "null".to_string(),
        Value::Bool(b) => if *b { "true" } else { "false" }.to_string(),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                i.to_string()
            } else if let Some(f) = n.as_f64() {
                if f == f.trunc() {
                    (f as i64).to_string()
                } else {
                    f.to_string()
                }
            } else {
                n.to_string()
            }
        }
        Value::String(s) => {
            let escaped = s
                .replace('\\', "\\\\")
                .replace('"', "\\\"")
                .replace('\n', "\\n")
                .replace('\r', "\\r")
                .replace('\t', "\\t");
            format!("\"{}\"", escaped)
        }
        Value::Array(arr) => {
            let items: Vec<String> = arr.iter().map(canonicalize_json).collect();
            format!("[{}]", items.join(","))
        }
        Value::Object(obj) => {
            // Sort keys alphabetically using BTreeMap
            let sorted: BTreeMap<_, _> = obj.iter().collect();
            let items: Vec<String> = sorted
                .iter()
                .map(|(k, v)| format!("{}:{}", canonicalize_json(&Value::String(k.to_string())), canonicalize_json(v)))
                .collect();
            format!("{{{}}}", items.join(","))
        }
    }
}

// ============================================================
// Hash Verification
// ============================================================

fn compute_hash(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    format!("sha256:{:x}", result)
}

fn verify_record_hash(decision: &Value) -> (bool, String) {
    let claimed_hash = match decision.get("record_hash").and_then(|v| v.as_str()) {
        Some(h) => h,
        None => return (false, "Missing record_hash".to_string()),
    };

    // Create copy without hash
    let mut record_copy = decision.as_object().unwrap().clone();
    record_copy.remove("record_hash");

    let canonical = canonicalize_json(&Value::Object(record_copy));
    let computed_hash = compute_hash(canonical.as_bytes());

    if claimed_hash == computed_hash {
        (true, "Hash verified".to_string())
    } else {
        (false, format!("Hash mismatch: expected {}, computed {}", claimed_hash, computed_hash))
    }
}

// ============================================================
// Signature Verification
// ============================================================

fn verify_signature_ed25519(public_key_b64: &str, message: &[u8], signature_b64: &str) -> (bool, String) {
    use base64::{Engine as _, engine::general_purpose::STANDARD};
    use ed25519_dalek::{Signature, VerifyingKey};

    let public_key_bytes = match STANDARD.decode(public_key_b64) {
        Ok(bytes) => bytes,
        Err(e) => return (false, format!("Invalid public key: {}", e)),
    };

    let signature_bytes = match STANDARD.decode(signature_b64) {
        Ok(bytes) => bytes,
        Err(e) => return (false, format!("Invalid signature: {}", e)),
    };

    let public_key: [u8; 32] = match public_key_bytes.try_into() {
        Ok(arr) => arr,
        Err(_) => return (false, "Invalid public key size".to_string()),
    };

    let verifying_key = match VerifyingKey::from_bytes(&public_key) {
        Ok(key) => key,
        Err(e) => return (false, format!("Invalid public key: {}", e)),
    };

    let signature: [u8; 64] = match signature_bytes.try_into() {
        Ok(arr) => arr,
        Err(_) => return (false, "Invalid signature size".to_string()),
    };

    let sig = Signature::from_bytes(&signature);

    match verifying_key.verify_strict(message, &sig) {
        Ok(()) => (true, "Signature verified".to_string()),
        Err(_) => (false, "Invalid signature".to_string()),
    }
}

// ============================================================
// Chain Verification
// ============================================================

fn verify_chain_position(chain_position: &Value, previous_hash: Option<&str>) -> (bool, String) {
    let sequence = chain_position.get("sequence_number")
        .and_then(|v| v.as_i64())
        .unwrap_or(0);

    let prev_hash = chain_position.get("previous_hash")
        .and_then(|v| v.as_str())
        .unwrap_or("");

    if sequence < 1 {
        return (false, format!("Invalid sequence number: {}", sequence));
    }

    if sequence == 1 {
        if !prev_hash.is_empty() && prev_hash != "genesis" {
            return (false, "Genesis record should not have previous hash".to_string());
        }
        return (true, "Genesis record verified".to_string());
    }

    if let Some(expected) = previous_hash {
        if prev_hash != expected {
            return (false, format!("Chain link broken: expected {}", expected));
        }
    }

    (true, "Chain position verified".to_string())
}

// ============================================================
// Bundle Verification
// ============================================================

fn verify_bundle(bundle: &ProofBundle, public_key: Option<&str>) -> VerificationResult {
    let mut result = VerificationResult::new();

    // 1. Hash verification
    let (hash_valid, hash_msg) = verify_record_hash(&bundle.decision);
    result.add_check("hash", hash_valid, &hash_msg);

    // 2. Chain verification
    let (chain_valid, chain_msg) = verify_chain_position(&bundle.chain_position, None);
    result.add_check("chain", chain_valid, &chain_msg);

    // 3. Signature verification
    if let Some(pk) = public_key {
        let record_hash = bundle.decision.get("record_hash")
            .and_then(|v| v.as_str())
            .unwrap_or("");
        let signature = bundle.attestation.get("signature")
            .and_then(|v| v.as_str())
            .unwrap_or("");

        let (sig_valid, sig_msg) = verify_signature_ed25519(pk, record_hash.as_bytes(), signature);
        result.add_check("signature", sig_valid, &sig_msg);
    } else {
        result.add_check("signature", true, "Skipped (no public key provided)");
    }

    // 4. Offline verifiability
    let offline = bundle.verification.get("verifiable_offline")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);
    
    if offline {
        result.add_check("offline", true, "Bundle is offline-verifiable");
    } else {
        result.add_check("offline", false, "Bundle not marked as offline-verifiable");
    }

    result
}

// ============================================================
// CLI
// ============================================================

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        println!("Regulayer Reference Verifier (Rust)");
        println!("Usage: cargo run --release -- <bundle.json> [public_key_base64]");
        println!("\nThis is a clean-room implementation for independent verification.");
        std::process::exit(1);
    }

    let bundle_path = &args[1];
    let public_key = args.get(2).map(|s| s.as_str());

    let data = match fs::read_to_string(bundle_path) {
        Ok(d) => d,
        Err(e) => {
            eprintln!("Error reading bundle: {}", e);
            std::process::exit(1);
        }
    };

    let bundle: ProofBundle = match serde_json::from_str(&data) {
        Ok(b) => b,
        Err(e) => {
            eprintln!("Error parsing bundle: {}", e);
            std::process::exit(1);
        }
    };

    let result = verify_bundle(&bundle, public_key);

    println!("\n{}", "=".repeat(50));
    println!("REGULAYER REFERENCE VERIFIER (RUST)");
    println!("{}", "=".repeat(50));
    println!("\nBundle: {}", bundle_path);
    println!("Result: {}\n", if result.valid { "✓ VALID" } else { "✗ INVALID" });

    for check in &result.checks {
        let status = if check.passed { "✓" } else { "✗" };
        println!("  {} {}: {}", status, check.name, check.message);
    }

    println!("\n{}", "=".repeat(50));
    println!("This verifier is independent of Regulayer systems.");
    println!("{}\n", "=".repeat(50));

    std::process::exit(if result.valid { 0 } else { 1 });
}
