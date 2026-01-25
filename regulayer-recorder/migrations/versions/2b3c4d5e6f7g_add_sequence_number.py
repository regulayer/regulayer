"""add sequence_number

Revision ID: 2b3c4d5e6f7g
Revises: 1a2b3c4d5e6f
Create Date: 2026-01-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '2b3c4d5e6f7g'
down_revision: Union[str, None] = '1a2b3c4d5e6f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new column
    op.add_column('decisions', sa.Column('sequence_number', sa.Integer(), nullable=True))
    # Create index for proper sorting per chain
    op.create_index('idx_decisions_chain_seq', 'decisions', ['chain_id', 'sequence_number'], unique=False) # Not unique yet due to legacy?


def downgrade() -> None:
    op.drop_index('idx_decisions_chain_seq', table_name='decisions')
    op.drop_column('decisions', 'sequence_number')
