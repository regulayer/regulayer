"""add attestation fields

Revision ID: 1a2b3c4d5e6f
Revises: 
Create Date: 2026-01-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '1a2b3c4d5e6f'
down_revision: Union[str, None] = None # Assuming first revision or check existing
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns as nullable
    op.add_column('decisions', sa.Column('signature_algorithm', sa.String(length=20), nullable=True))
    op.add_column('decisions', sa.Column('identity_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('decisions', sa.Column('signed_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('decisions', sa.Column('attestation_payload', sa.JSON(), nullable=True))
    
    # Create index for identity_id
    op.create_index('idx_decisions_identity', 'decisions', ['identity_id'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_decisions_identity', table_name='decisions')
    op.drop_column('decisions', 'attestation_payload')
    op.drop_column('decisions', 'signed_at')
    op.drop_column('decisions', 'identity_id')
    op.drop_column('decisions', 'signature_algorithm')
