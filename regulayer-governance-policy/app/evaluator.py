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
    
    async def evaluate_condition(self, condition: PolicyCondition, context: Dict[str, Any]) -> bool:
        """
        Evaluate a single condition against context.
        Supports dotted-notation for nested fields (e.g. 'metadata.confidence').
        """
        # Resolve nested field path
        field_path = condition.field.split('.')
        field_value = context
        for key in field_path:
            if isinstance(field_value, dict):
                field_value = field_value.get(key)
            else:
                field_value = None
                break
                
        target_value = condition.value
        
        if condition.operator == PolicyConditionOperator.EQ:
            if isinstance(field_value, str) and isinstance(target_value, str):
                return field_value.lower() == target_value.lower()
            return field_value == target_value
            
        elif condition.operator == PolicyConditionOperator.NEQ:
            if isinstance(field_value, str) and isinstance(target_value, str):
                return field_value.lower() != target_value.lower()
            return field_value != target_value
            
        elif condition.operator == PolicyConditionOperator.IN:
            if isinstance(target_value, list):
                if isinstance(field_value, str):
                    # Check if any target value (lowercased) matches the field value
                    field_lower = field_value.lower()
                    return any(str(t).lower() == field_lower for t in target_value)
                return field_value in target_value
            return False
            
        elif condition.operator == PolicyConditionOperator.NOT_IN:
            if isinstance(target_value, list):
                if isinstance(field_value, str):
                    field_lower = field_value.lower()
                    return not any(str(t).lower() == field_lower for t in target_value)
                return field_value not in target_value
            return True
            
        # Shared helper to flatten dicts/lists into a single text block for string operations
        def _extract_all_text(obj, parts=None):
            if parts is None:
                parts = []
            if isinstance(obj, str):
                parts.append(obj)
            elif isinstance(obj, dict):
                for v in obj.values():
                    _extract_all_text(v, parts)
            elif isinstance(obj, list):
                for item in obj:
                    _extract_all_text(item, parts)
            elif obj is not None:
                parts.append(str(obj))
            return parts

        if condition.operator == PolicyConditionOperator.CONTAINS:
            if target_value is None:
                return False
                
            target_str = str(target_value).lower()
            text_parts = _extract_all_text(field_value)
            full_text = "\n".join(text_parts).lower()
            return target_str in full_text
            
        elif condition.operator == PolicyConditionOperator.NOT_CONTAINS:
            if target_value is None:
                return True
                
            target_str = str(target_value).lower()
            text_parts = _extract_all_text(field_value)
            full_text = "\n".join(text_parts).lower()
            return target_str not in full_text
            
        elif condition.operator == PolicyConditionOperator.STARTS_WITH:
            if target_value is None or field_value is None:
                return False
                
            text_parts = _extract_all_text(field_value)
            full_text = "\n".join(text_parts).lower()
            return full_text.startswith(str(target_value).lower())
            
        elif condition.operator == PolicyConditionOperator.REGEX:
            import re
            if target_value is None or field_value is None:
                return False
                
            text_parts = _extract_all_text(field_value)
            full_text = "\n".join(text_parts)
            try:
                return bool(re.search(str(target_value), full_text))
            except re.error:
                return False
            
        elif condition.operator in (PolicyConditionOperator.GT, PolicyConditionOperator.LT, PolicyConditionOperator.GTE, PolicyConditionOperator.LTE):
            try:
                f_val = float(field_value)
                t_val = float(target_value)
                if condition.operator == PolicyConditionOperator.GT: return f_val > t_val
                if condition.operator == PolicyConditionOperator.LT: return f_val < t_val
                if condition.operator == PolicyConditionOperator.GTE: return f_val >= t_val
                if condition.operator == PolicyConditionOperator.LTE: return f_val <= t_val
            except (ValueError, TypeError):
                return False
                
        elif condition.operator == PolicyConditionOperator.LLM_EVALUATE:
            if target_value is None or field_value is None:
                return False
            
            # If field_value is a dict, extract all string values recursively
            def _extract_text(obj, parts=None):
                if parts is None:
                    parts = []
                if isinstance(obj, str):
                    parts.append(obj)
                elif isinstance(obj, dict):
                    for v in obj.values():
                        _extract_text(v, parts)
                elif isinstance(obj, list):
                    for item in obj:
                        _extract_text(item, parts)
                return parts
            
            if isinstance(field_value, dict):
                text_parts = _extract_text(field_value)
                field_value = "\n".join(text_parts) if text_parts else ""
            elif not isinstance(field_value, str):
                field_value = str(field_value)
                
            if not field_value:
                return False
                
            from .config import settings
            import httpx
            
            if not hasattr(settings, 'groq_api_key') or not settings.groq_api_key:
                return False
                
            prompt = f"Evaluate if this text meets the following condition: '{target_value}'\n\nText: {field_value}\n\nAnswer only YES if it meets the condition, or NO if it does not."
            
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.groq_api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "llama-3.1-8b-instant",
                            "messages": [{"role": "user", "content": prompt}],
                            "temperature": 0.0,
                            "max_tokens": 5
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        reply = data["choices"][0]["message"]["content"].strip().upper()
                        return "YES" in reply
            except Exception as e:
                import logging
                logging.error(f"LLM evaluate failed: {e}")
                
            return False
            
        return False
    
    async def evaluate_policy(
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
        if getattr(policy, 'applies_to', None) and len(policy.applies_to) > 0:
            if "all" not in policy.applies_to:
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
        # Short-circuit: stop evaluating if any condition returns False
        if not policy.conditions:
            return PolicyEvaluationResult(
                policy_id=policy.policy_id,
                policy_name=policy.name,
                matched=False,
                actions_executed=[],
                evaluated_at=datetime.now(timezone.utc)
            )
            
        all_match = True
        for cond in policy.conditions:
            res = await self.evaluate_condition(cond, context)
            if not res:
                all_match = False
                break
                
        actions_to_execute = []
        if all_match:
            actions_to_execute = [
                f"{action.type if isinstance(action.type, str) else action.type.value}:{action.parameters}"
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
        context = dict(decision_data)
        
        # Ensure we have specific mapped fields
        context["attestation_status"] = "attested" if decision_data.get("attestation") else "legacy"
        context["review_state"] = governance_data.get("review_state", "unreviewed")
        context["tags"] = [t.get("name") for t in governance_data.get("tags", [])]
        
        # Add any remaining governance data
        for k, v in governance_data.items():
            if k not in ["review_state", "tags"]:
                context[k] = v
                
        return context


# Global evaluator instance
evaluator = PolicyEvaluator()
