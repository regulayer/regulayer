# Regulayer Kill Switch Protocol

> [!CAUTION]
> This protocol is for EMERGENCY USE ONLY.
> Use this when:
> - Active data corruption is detected.
> - Security breach is confirmed.
> - Uncontrolled loop/resource exhaustion.

## 1. Gateway Isolation (Stop New Ingestion)
The fastest way to stop damage is to block the Ingestion Gateway.

```bash
# Option A: Suspend Service
docker-compose pause gateway

# Option B: Scale to 0
docker-compose up -d --scale gateway=0
```

## 2. Queue Freeze (Stop Processing)
If the Gateway is down but the Queue still has malicious payloads:

```bash
# Pause the processor (Recorder)
docker-compose pause recorder
```

## 3. Read-Only Mode (Preserve Evidence)
To allow forensic analysis without allowing changes:

1. Stop `gateway`, `recorder`, `control-plane`.
2. Keep `postgres` and `redis` running.
3. Take immediate backup:
   ```bash
   docker exec -t postgres pg_dumpall -c -U postgres > forensic_dump_$(date +%s).sql
   ```

## 4. Total Shutdown
```bash
docker-compose down
```

## 5. Communication
1. Update Status Page (StatusPage.io / Discord) to **Major Outage**.
2. Email all Enterprise admins via SendGrid Emergency List.
