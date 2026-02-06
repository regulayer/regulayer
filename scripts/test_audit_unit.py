
import unittest
from unittest.mock import MagicMock, ANY
from uuid import uuid4, UUID
import sys
import os

# Add control plane app to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'regulayer-control-plane')))

from app.audit import AuditService
from app.models import AuditLog
from app.storage import AuditLogDB

class TestAuditService(unittest.TestCase):
    def setUp(self):
        self.mock_db = MagicMock()
        self.audit_service = AuditService(self.mock_db)
        self.org_id = uuid4()
        self.user_id = uuid4()

    def test_log_creation(self):
        """Test creating an audit log entry."""
        log = self.audit_service.log(
            organization_id=self.org_id,
            action="test.action",
            resource_type="test_resource",
            actor_id=self.user_id,
            details={"foo": "bar"}
        )

        # check that db.add was called with an AuditLogDB instance
        self.mock_db.add.assert_called_once()
        args, _ = self.mock_db.add.call_args
        entry = args[0]
        self.assertIsInstance(entry, AuditLogDB)
        self.assertEqual(entry.organization_id, self.org_id)
        self.assertEqual(entry.action, "test.action")
        self.assertEqual(entry.details, {"foo": "bar"})
        
        # Check return type
        self.assertIsInstance(log, AuditLog)
        self.assertEqual(log.organization_id, self.org_id)

    def test_get_logs(self):
        """Test retrieving logs."""
        # Setup mock return values
        mock_log_db = AuditLogDB(
            id=uuid4(),
            organization_id=self.org_id,
            action="test.action",
            resource_type="test",
            created_at=None
        )
        
        # Mock the chained query: db.query(...).filter(...).order_by(...).limit(...).offset(...).all()
        query_mock = self.mock_db.query.return_value
        filter_mock = query_mock.filter.return_value
        order_mock = filter_mock.order_by.return_value
        limit_mock = order_mock.limit.return_value
        offset_mock = limit_mock.offset.return_value
        offset_mock.all.return_value = [mock_log_db]
        
        logs = self.audit_service.get_logs(self.org_id)
        
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs[0].action, "test.action")
        self.assertIsInstance(logs[0], AuditLog)

if __name__ == '__main__':
    unittest.main()
