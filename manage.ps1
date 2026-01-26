param (
    [string]$Command
)

switch ($Command) {
    "setup" {
        Copy-Item .env.example .env
        Write-Host "Environment setup complete. Copied .env.example to .env"
    }
    "boot" {
        docker-compose up --build -d
    }
    "down" {
        docker-compose down
    }
    "seed-demo" {
        docker-compose run --rm control-plane python scripts/seed_demo.py
        Write-Host "Demo Org Created."
    }
    "verify-offline" {
        Write-Host "Verifying local export..."
        python regulayer-proof-verifier/cli/verify.py --file ./demo_export.json
    }
    "clean" {
        docker-compose down -v
        if (Test-Path "postgres_data") {
            Remove-Item -Path "postgres_data" -Recurse -Force
        }
        Write-Host "Cleaned up containers and volumes."
    }
    Default {
        Write-Host "Usage: .\manage.ps1 [setup|boot|down|seed-demo|verify-offline|clean]"
        Write-Host "  setup          - Copy .env.example to .env"
        Write-Host "  boot           - Start the full stack"
        Write-Host "  down           - Stop the stack"
        Write-Host "  seed-demo      - Populate with demo data"
        Write-Host "  verify-offline - Run offline verifier"
        Write-Host "  clean          - Nuclear option (wipe data)"
    }
}
