import click
import sys
import json
from typing import Dict, Any

from .verify import verify_proof_command
from .verify_chain import verify_chain_command
from .errors import VerificationError

@click.group()
def cli():
    """Regulayer Independent Proof Verifier"""
    pass

@cli.command(name="verify-proof")
@click.argument("proof_file", type=click.Path(exists=True))
@click.option("--json", "json_output", is_flag=True, help="Output machine-readable JSON.")
def verify_proof(proof_file, json_output):
    """
    Verify a single proof bundle.
    """
    try:
        result = verify_proof_command(proof_file)
        
        if json_output:
            click.echo(json.dumps({
                "status": "PASS",
                "file": proof_file
            }, indent=2))
        else:
            click.echo(f"PASS: {proof_file} verified successfully.")
            
    except VerificationError as e:
        if json_output:
            click.echo(json.dumps({
                "status": "FAIL",
                "error_code": e.code,
                "details": e.message,
                "file": proof_file
            }, indent=2))
        else:
            click.echo(f"FAIL: {e.code} - {e.message}", err=True)
        sys.exit(1)
    except Exception as e:
        if json_output:
            click.echo(json.dumps({
                "status": "FAIL",
                "error_code": "INTERNAL_ERROR",
                "details": str(e),
                "file": proof_file
            }, indent=2))
        else:
            click.echo(f"INTERNAL ERROR: {str(e)}", err=True)
        sys.exit(1)

@cli.command(name="verify-chain")
@click.argument("proof_dir", type=click.Path(exists=True, file_okay=False, dir_okay=True))
@click.option("--strict", is_flag=True, help="Enforce strict sequence (no gaps).")
@click.option("--json", "json_output", is_flag=True, help="Output machine-readable JSON.")
def verify_chain(proof_dir, strict, json_output):
    """
    Verify a directory of proof bundles as a chain.
    """
    try:
        result = verify_chain_command(proof_dir, strict)
        
        if json_output:
            click.echo(json.dumps(result, indent=2))
        else:
            click.echo(f"PASS: Chain verified successfully. {result['total_records']} records checked.")
            
    except VerificationError as e:
        if json_output:
            click.echo(json.dumps({
                "status": "FAIL",
                "error_code": e.code,
                "details": e.message
            }, indent=2))
        else:
            click.echo(f"FAIL: {e.code} - {e.message}", err=True)
        sys.exit(1)
    except Exception as e:
        # Same handling
        if json_output:
             click.echo(json.dumps({
                "status": "FAIL",
                "error_code": "INTERNAL_ERROR",
                "details": str(e)
            }, indent=2))
        else:
            click.echo(f"INTERNAL ERROR: {str(e)}", err=True)
        sys.exit(1)

if __name__ == "__main__":
    cli()
