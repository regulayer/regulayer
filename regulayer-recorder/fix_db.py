import asyncio
from sqlalchemy import text
from app.storage import get_db_session

async def fix_broken_chains():
    print('Starting database repair...')
    async for session in get_db_session():
        try:
            # 1. Select all distinct corrupted chain_ids that have commas
            stmt = text("SELECT DISTINCT chain_id FROM decisions WHERE chain_id LIKE '%,%'")
            result = await session.execute(stmt)
            corrupted_chains = [row[0] for row in result.all()]
            
            if not corrupted_chains:
                print('No corrupted comma-separated chain IDs found.')
                return
                
            for bad_id in corrupted_chains:
                # The corrected ID is the first UUID before the comma
                good_id = bad_id.split(',')[0].strip()
                
                # Execute a direct stealth UPDATE completely bypassing SQLAlchemy models
                # because the ORM enforces append-only rules.
                update_stmt = text("UPDATE decisions SET chain_id = :good_id WHERE chain_id = :bad_id")
                await session.execute(update_stmt, {'good_id': good_id, 'bad_id': bad_id})
                print(f'Repaired orphaned records: {bad_id} -> {good_id}')
                
            await session.commit()
            print('Successfully repaired all orphaned records.')
            
        except Exception as e:
            await session.rollback()
            print(f'Failed to repair: {e}')

if __name__ == "__main__":
    asyncio.run(fix_broken_chains())
