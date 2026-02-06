import asyncio
import os
import sys
import redis.asyncio as redis

# Add path to sys to allow imports
sys.path.append(os.getcwd())

from app.consumer import QueueConsumer
from app.config import settings

async def auto_discovery_worker():
    consumer = QueueConsumer()
    consumer.running = True # Enable loop
    print("Queue Worker Auto-Discovery mode enabled.", flush=True)
    
    r = redis.from_url(settings.redis_url)
    
    active_tasks = {}
    
    while True:
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
                for pid in project_ids:
                    if pid not in active_tasks:
                        print(f"Spawning consumer for {pid}", flush=True)
                        active_tasks[pid] = asyncio.create_task(consumer.consume_project(pid))
                        
        except Exception as e:
            print(f"Discovery error: {e}", flush=True)
            
        await asyncio.sleep(2) # Poll faster

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    try:
        asyncio.run(auto_discovery_worker())
    except KeyboardInterrupt:
        print("Worker stopping...", flush=True)
