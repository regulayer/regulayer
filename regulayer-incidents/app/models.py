
from sqlalchemy import Column, Integer, String, DateTime, Text, FetchedValue
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

from .db import Base

class IncidentEventDB(Base):
    """
    Log of system incidents.
    """
    __tablename__ = "incident_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), nullable=True, index=True) # Null for system-wide
    
    incident_type = Column(String(100), nullable=False, index=True) # ENUM
    severity = Column(String(20), nullable=False, index=True) # info, warning, critical
    source = Column(String(50), nullable=False) # recorder, queue, gateway
    
    status = Column(String(50), nullable=False, server_default="open", default="open", index=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    message = Column(Text, nullable=False)
    metadata_json = Column("metadata", JSONB, nullable=True) # Structured details
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

class IncidentTicketDB(Base):
    """
    Mutable incident lifecycle state tracking table.
    """
    __tablename__ = "incident_tickets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    decision_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    
    status = Column(String(50), nullable=False, default="open", index=True) # open, resolved
    assigned_to = Column(UUID(as_uuid=True), nullable=True, index=True)
    
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
