// Regulayer Reference Verifier (Go)
//
// CLEAN-ROOM IMPLEMENTATION
// This verifier shares NO code with Regulayer production systems.
// It exists solely to prove that verification is reproducible by anyone.
//
// Usage:
//     go run verifier.go bundle.json [public_key_base64]

package main

import (
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"
	"time"
)

// ============================================================
// Data Structures
// ============================================================

type ProofBundle struct {
	SchemaVersion string                 `json:"schema_version"`
	BundleID      string                 `json:"bundle_id"`
	Decision      Decision               `json:"decision"`
	Attestation   Attestation            `json:"attestation"`
	ChainPosition ChainPosition          `json:"chain_position"`
	Verification  map[string]interface{} `json:"verification"`
}

type Decision struct {
	DecisionID string `json:"decision_id"`
	RecordHash string `json:"record_hash"`
	RecordedAt string `json:"recorded_at"`
}

type Attestation struct {
	Signature string `json:"signature"`
	Algorithm string `json:"algorithm"`
	KeyID     string `json:"key_id"`
}

type ChainPosition struct {
	SequenceNumber int    `json:"sequence_number"`
	PreviousHash   string `json:"previous_hash"`
}

type VerificationCheck struct {
	Name    string `json:"name"`
	Passed  bool   `json:"passed"`
	Message string `json:"message"`
}

type VerificationResult struct {
	Valid      bool                `json:"valid"`
	Checks     []VerificationCheck `json:"checks"`
	VerifiedAt string              `json:"verified_at"`
}

// ============================================================
// Canonicalization (RFC 8785)
// ============================================================

func canonicalizeJSON(data interface{}) ([]byte, error) {
	switch v := data.(type) {
	case nil:
		return []byte("null"), nil
	case bool:
		if v {
			return []byte("true"), nil
		}
		return []byte("false"), nil
	case float64:
		if v == float64(int(v)) {
			return []byte(fmt.Sprintf("%d", int(v))), nil
		}
		return []byte(fmt.Sprintf("%v", v)), nil
	case string:
		escaped := strings.ReplaceAll(v, "\\", "\\\\")
		escaped = strings.ReplaceAll(escaped, "\"", "\\\"")
		escaped = strings.ReplaceAll(escaped, "\n", "\\n")
		escaped = strings.ReplaceAll(escaped, "\r", "\\r")
		escaped = strings.ReplaceAll(escaped, "\t", "\\t")
		return []byte(fmt.Sprintf("\"%s\"", escaped)), nil
	case []interface{}:
		var items []string
		for _, item := range v {
			canonical, err := canonicalizeJSON(item)
			if err != nil {
				return nil, err
			}
			items = append(items, string(canonical))
		}
		return []byte("[" + strings.Join(items, ",") + "]"), nil
	case map[string]interface{}:
		var keys []string
		for k := range v {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		var items []string
		for _, k := range keys {
			keyCanon, _ := canonicalizeJSON(k)
			valCanon, err := canonicalizeJSON(v[k])
			if err != nil {
				return nil, err
			}
			items = append(items, string(keyCanon)+":"+string(valCanon))
		}
		return []byte("{" + strings.Join(items, ",") + "}"), nil
	default:
		return nil, fmt.Errorf("cannot canonicalize type: %T", v)
	}
}

// ============================================================
// Hash Verification
// ============================================================

func computeHash(data []byte) string {
	hash := sha256.Sum256(data)
	return fmt.Sprintf("sha256:%x", hash)
}

func verifyRecordHash(decision map[string]interface{}) (bool, string) {
	claimedHash, ok := decision["record_hash"].(string)
	if !ok {
		return false, "Missing record_hash"
	}

	// Create copy without hash
	recordCopy := make(map[string]interface{})
	for k, v := range decision {
		if k != "record_hash" {
			recordCopy[k] = v
		}
	}

	canonical, err := canonicalizeJSON(recordCopy)
	if err != nil {
		return false, fmt.Sprintf("Canonicalization error: %v", err)
	}

	computedHash := computeHash(canonical)

	if claimedHash == computedHash {
		return true, "Hash verified"
	}
	return false, fmt.Sprintf("Hash mismatch: expected %s, computed %s", claimedHash, computedHash)
}

// ============================================================
// Signature Verification
// ============================================================

func verifySignatureEd25519(publicKeyB64, message, signatureB64 string) (bool, string) {
	publicKey, err := base64.StdEncoding.DecodeString(publicKeyB64)
	if err != nil {
		return false, fmt.Sprintf("Invalid public key: %v", err)
	}

	signature, err := base64.StdEncoding.DecodeString(signatureB64)
	if err != nil {
		return false, fmt.Sprintf("Invalid signature: %v", err)
	}

	if len(publicKey) != ed25519.PublicKeySize {
		return false, "Invalid public key size"
	}

	if ed25519.Verify(publicKey, []byte(message), signature) {
		return true, "Signature verified"
	}
	return false, "Invalid signature"
}

// ============================================================
// Chain Verification
// ============================================================

func verifyChainPosition(chainPosition ChainPosition, previousHash string) (bool, string) {
	if chainPosition.SequenceNumber < 1 {
		return false, fmt.Sprintf("Invalid sequence number: %d", chainPosition.SequenceNumber)
	}

	if chainPosition.SequenceNumber == 1 {
		if chainPosition.PreviousHash != "" && chainPosition.PreviousHash != "genesis" {
			return false, "Genesis record should not have previous hash"
		}
		return true, "Genesis record verified"
	}

	if previousHash != "" && chainPosition.PreviousHash != previousHash {
		return false, fmt.Sprintf("Chain link broken: expected %s", previousHash)
	}

	return true, "Chain position verified"
}

// ============================================================
// Bundle Verification
// ============================================================

func verifyBundle(bundle map[string]interface{}, publicKey, previousHash string) VerificationResult {
	result := VerificationResult{
		Valid:      true,
		Checks:     []VerificationCheck{},
		VerifiedAt: time.Now().UTC().Format(time.RFC3339),
	}

	addCheck := func(name string, passed bool, message string) {
		result.Checks = append(result.Checks, VerificationCheck{
			Name:    name,
			Passed:  passed,
			Message: message,
		})
		if !passed {
			result.Valid = false
		}
	}

	// 1. Schema presence
	requiredFields := []string{"decision", "attestation", "chain_position", "verification"}
	for _, field := range requiredFields {
		if _, ok := bundle[field]; !ok {
			addCheck("schema."+field, false, "Missing required field: "+field)
		}
	}

	if !result.Valid {
		return result
	}

	decision := bundle["decision"].(map[string]interface{})
	attestation := bundle["attestation"].(map[string]interface{})
	chainPosition := bundle["chain_position"].(map[string]interface{})

	// 2. Hash verification
	hashValid, hashMsg := verifyRecordHash(decision)
	addCheck("hash", hashValid, hashMsg)

	// 3. Chain verification
	cp := ChainPosition{
		SequenceNumber: int(chainPosition["sequence_number"].(float64)),
		PreviousHash:   chainPosition["previous_hash"].(string),
	}
	chainValid, chainMsg := verifyChainPosition(cp, previousHash)
	addCheck("chain", chainValid, chainMsg)

	// 4. Signature verification
	if publicKey != "" {
		recordHash := decision["record_hash"].(string)
		signature := attestation["signature"].(string)
		sigValid, sigMsg := verifySignatureEd25519(publicKey, recordHash, signature)
		addCheck("signature", sigValid, sigMsg)
	} else {
		addCheck("signature", true, "Skipped (no public key provided)")
	}

	// 5. Offline verifiability
	verification := bundle["verification"].(map[string]interface{})
	if verification["verifiable_offline"] == true {
		addCheck("offline", true, "Bundle is offline-verifiable")
	} else {
		addCheck("offline", false, "Bundle not marked as offline-verifiable")
	}

	return result
}

// ============================================================
// CLI
// ============================================================

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Regulayer Reference Verifier (Go)")
		fmt.Println("Usage: go run verifier.go <bundle.json> [public_key_base64]")
		fmt.Println("\nThis is a clean-room implementation for independent verification.")
		os.Exit(1)
	}

	bundlePath := os.Args[1]
	publicKey := ""
	if len(os.Args) > 2 {
		publicKey = os.Args[2]
	}

	data, err := os.ReadFile(bundlePath)
	if err != nil {
		fmt.Printf("Error reading bundle: %v\n", err)
		os.Exit(1)
	}

	var bundle map[string]interface{}
	if err := json.Unmarshal(data, &bundle); err != nil {
		fmt.Printf("Error parsing bundle: %v\n", err)
		os.Exit(1)
	}

	result := verifyBundle(bundle, publicKey, "")

	fmt.Println("\n" + strings.Repeat("=", 50))
	fmt.Println("REGULAYER REFERENCE VERIFIER (GO)")
	fmt.Println(strings.Repeat("=", 50))
	fmt.Printf("\nBundle: %s\n", bundlePath)

	if result.Valid {
		fmt.Println("Result: ✓ VALID")
	} else {
		fmt.Println("Result: ✗ INVALID")
	}
	fmt.Println()

	for _, check := range result.Checks {
		status := "✓"
		if !check.Passed {
			status = "✗"
		}
		fmt.Printf("  %s %s: %s\n", status, check.Name, check.Message)
	}

	fmt.Println("\n" + strings.Repeat("=", 50))
	fmt.Println("This verifier is independent of Regulayer systems.")
	fmt.Println(strings.Repeat("=", 50) + "\n")

	if result.Valid {
		os.Exit(0)
	}
	os.Exit(1)
}
