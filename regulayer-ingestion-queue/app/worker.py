import asyncio
import os
import sys

# Add path to sys to allow imports
sys.path.append(os.getcwd())

from app.consumer import run_consumer
from app.config import settings

if __name__ == "__main__":
    print("Starting Queue Worker...")
    # For demo, consume all projects. 
    # In V2, this would be dynamic or sharded.
    # We will use a wildcard or scan for active projects.
    # For now, let's just listen to "global" or read from Redis streams dynamically?
    # Redis Stream consumer groups usually need specific stream keys.
    # Our architecture is per-project streams.
    # For MVP/Demo success, we will scan for keys matching the prefix.
    # OR, since the consumer.py logic handles strict ordering per-project, we can have a loop that 
    # periodically scans redis for active streams? 
    # Actually, Consumer.run(project_ids) expects a list.
    
    # IMPROVEMENT: Let's make the worker smart enough to pick up work.
    # For now, we'll just run for specific known projects or a default project.
    
    # HACK for Demo: Wait for project ID to be passed or just run loop
    # If no projects, it exits? No, run_consumer runs indefinitely.
    
    # Let's fix consumer.py to be dynamic in V2. 
    # For Phase H demo, we seed a project. We need the worker to know about it.
    
    # Since we can't easily know the UUIDs in advance, let's make the worker
    # generic or listen to a "discovery" channel.
    # Or simplified: All ingested verification requests go to ONE stream in MVP?
    # No, design said per-project.
    
    # Fallback: Just keep running and polling?
    # Let's updated main.py to be empty simple runner
    
    # We will make it run an event loop pending external triggers or just sleep.
    # Beacuse we don't know project IDs, this worker is useless unless modified to auto-discover.
    # CRITICAL FIX for Demo:
    # 1. Update `producer.py` to push to a `global_discovery` list?
    # 2. Or just run for a hardcoded "demo" project if we could fixed UUID?
    
    # Decision: We will rely on `seed_demo` to insert data. 
    # But wait, `seed_demo` creates a random UUID project.
    # The worker won't know to consume it.
    
    # FIX: Update `api.py` (Control Plane) to publish "New Project" event to Redis?
    # Too complex for right now.
    
    # FIX 2 (The Right Way for MVP):
    # Use ONE Redis stream `ingestion:global` partition by project ID inside the payload?
    # But strict ordering requires per-project streams for blocking?
    # Yes.
    
    # Hack for now: 
    # Worker loop: `KEYS ingestion:*` -> Run consumer for found keys.
    pass

import asyncio
from app.consumer import QueueConsumer
from app.config import settings
import redis.asyncio as redis

async def auto_discovery_worker():
    consumer = QueueConsumer()
    print("Queue Worker Auto-Discovery mode enabled.")
    
    r = redis.from_url(settings.redis_url)
    
    active_tasks = {}
    
    while True:
        # Scan for streams
        # Keys matching prefix
        try:
            # Match "ingestion:*"
            keys = await r.keys(f"{settings.redis_stream_prefix}:*")
            project_ids = []
            for k in keys:
                # k is bytes usually
                key_str = k.decode() if isinstance(k, bytes) else k
                # Format: "ingestion:<uuid>"
                pid = key_str.split(":")[-1]
                project_ids.append(pid)
            
            if project_ids:
                # naive restart of consumer not ideal.
                # Ideally we spawn tasks.
                # consumer.run() takes a list. 
                # Let's just run them all for now.
                print(f"Found active projects: {len(project_ids)}")
                # This blocks, so we can't loop.
                # We need the consumer to be continuous.
                
                # Re-designing consumer.py slightly or just spawning tasks here
                for pid in project_ids:
                    if pid not in active_tasks:
                        print(f"Spawning consumer for {pid}")
                        active_tasks[pid] = asyncio.create_task(consumer.consume_project(pid))
                        
        except Exception as e:
            print(f"Discovery error: {e}")
            
        await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(auto_discovery_worker())
