"""
Regulayer Governance Policy - Evaluation Engine

CRITICAL CONSTRAINTS:
1. Policy evaluation produces governance changes, NEVER recorder changes
2. Evaluation is declarative: no arbitrary code, no scripting
3. All evaluations are logged immutably
"""

from datetime import datetime, timezone
from typing import Dict, Any, List
from uuid import UUID

from .models import (
    PolicyCondition,
    PolicyConditionField,
    PolicyConditionOperator,
    PolicyAction,
    PolicyActionType,
    PolicyEvaluationResult,
    GovernancePolicy
)


class PolicyEvaluator:
    """
    Declarative policy evaluation engine.
    
    Evaluates conditions against decision/governance metadata.
    No side effects during evaluation - actions are returned, not executed.
    """
    
    def evaluate_condition(self, condition: PolicyCondition, context: Dict[str, Any]) -> bool:
        """
        Evaluate a single condition against context.
        
        Args:
            condition: The condition to evaluate
            context: Dict with keys like 'risk_level', 'event_state', 'tags', etc.
            
        Returns:
            True if condition matches, False otherwise
        """
        field_value = context.get(condition.field.value)
        target_value = condition.value
        
        if condition.operator == PolicyConditionOperator.EQ:
            return field_value == target_value
            
        elif condition.operator == PolicyConditionOperator.NEQ:
            return field_value != target_value
            
        elif condition.operator == PolicyConditionOperator.IN:
            if isinstance(target_value, list):
                return field_value in target_value
            return False
            
        elif condition.operator == PolicyConditionOperator.CONTAINS:
            # For tags or list fields
            if isinstance(field_value, list):
                return target_value in field_value
            if isinstance(field_value, str):
                return target_value in field_value
            return False
            
        return False
    
    def evaluate_policy(
        self, 
        policy: GovernancePolicy, 
        context: Dict[str, Any]
    ) -> PolicyEvaluationResult:
        """
        Evaluate a policy against a decision context.
        
        Args:
            policy: The policy to evaluate
            context: Decision and governance metadata
            
        Returns:
            PolicyEvaluationResult with match status and actions to execute
        """
        if not policy.enabled:
            return PolicyEvaluationResult(
                policy_id=policy.policy_id,
                policy_name=policy.name,
                matched=False,
                actions_executed=[],
                evaluated_at=datetime.now(timezone.utc)
            )
        
        # Check applies_to filter
        if policy.applies_to:
            system_name = context.get("system_name", "")
            if system_name not in policy.applies_to:
                return PolicyEvaluationResult(
                    policy_id=policy.policy_id,
                    policy_name=policy.name,
                    matched=False,
                    actions_executed=[],
                    evaluated_at=datetime.now(timezone.utc)
                )
        
        # Evaluate all conditions (AND logic)
        all_match = all(
            self.evaluate_condition(cond, context)
            for cond in policy.conditions
        )
        
        actions_to_execute = []
        if all_match:
            actions_to_execute = [
                f"{action.type.value}:{action.parameters}"
                for action in policy.actions
            ]
        
        return PolicyEvaluationResult(
            policy_id=policy.policy_id,
            policy_name=policy.name,
            matched=all_match,
            actions_executed=actions_to_execute,
            evaluated_at=datetime.now(timezone.utc)
        )
    
    def build_context(
        self,
        decision_data: Dict[str, Any],
        governance_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Build evaluation context from decision and governance data.
        
        This merges recorder facts with governance metadata for evaluation.
        """
        return {
            # From decision record
            "risk_level": decision_data.get("risk_level"),
            "event_state": decision_data.get("event_state"),
            "system_name": decision_data.get("system_name"),
            "attestation_status": "attested" if decision_data.get("attestation") else "legacy",
            
            # From governance metadata
            "review_state": governance_data.get("review_state", "unreviewed"),
            "tags": [t.get("name") for t in governance_data.get("tags", [])],
        }


# Global evaluator instance
evaluator = PolicyEvaluator()
