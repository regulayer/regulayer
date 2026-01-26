.PHONY: setup boot down seed-demo verify-offline clean

# Setup environment
setup:
	cp .env.example .env

# Boot the full stack
boot:
	docker-compose up --build -d

# Shut down
down:
	docker-compose down

# Seed demo data
seed-demo:
	docker-compose run --rm control-plane python scripts/seed_demo.py
	@echo "Demo Org Created. API Key available in logs."

# Run offline verification on exported proofs
verify-offline:
	@echo "Verifying local export..."
	python3 regulayer-proof-verifier/cli/verify.py --file ./demo_export.json

# CI Smoke Test (Fail fast)
ci-smoke:
	./scripts/smoke_test.sh

# Clean everything (Nuclear option)
clean:
	docker-compose down -v
	rm -rf postgres_data
