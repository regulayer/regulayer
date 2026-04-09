from typing import Dict, List, Tuple
from collections import deque
from datetime import datetime, timezone
import math

class AnomalyDetector:
    """
    Tracks the statistical baseline of decisions per project.
    If the AI begins making highly anomalous, erratic decisions (e.g. failing rapidly),
    this detector triggers an Emergency Freeze (Anomaly Block).
    """
    def __init__(self, window_size: int = 50, anomaly_threshold_stddevs: float = 3.0):
        # Maps project_id -> deque of (timestamp, is_violation)
        self.history: Dict[str, deque] = {}
        self.window_size = window_size
        self.threshold = anomaly_threshold_stddevs
        
    def record_decision(self, project_id: str, is_violation: bool) -> Tuple[bool, str]:
        """
        Record the decision outcome and return True if an anomaly freeze should be triggered.
        Returns: (is_anomalous, reason)
        """
        if not project_id or project_id == "None":
            project_id = "global"

        if project_id not in self.history:
            self.history[project_id] = deque(maxlen=self.window_size)
            
        now = datetime.now(timezone.utc).timestamp()
        
        # We store 1.0 for violation, 0.0 for pass
        val = 1.0 if is_violation else 0.0
        
        # Calculate recent velocity BEFORE appending
        current_deque = self.history[project_id]
        
        # If we don't have enough data, just append and return False
        if len(current_deque) < 10:
            current_deque.append((now, val))
            return False, ""
            
        # Calculate mean and stddev of violations in the window
        values = [v for _, v in current_deque]
        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / len(values)
        stddev = math.sqrt(variance)
        
        # If standard deviation is 0 (all exactly same), we can't really do Z-score.
        # But if the current is a violation and all previous were 0, that's a spike.
        if stddev == 0:
            if mean == 0.0 and val == 1.0:
                # First violation after pristine history.
                # Is it an anomaly? Only if we have a lot of history.
                if len(current_deque) >= self.window_size // 2:
                    current_deque.append((now, val))
                    # We might not block on the very first failure, but if they come in instantly.
                    return False, ""
        else:
            z_score = (val - mean) / stddev
            
            # Additional check: How fast are these coming in?
            # If the last 5 records are all violations and arrived within 2 seconds.
            recent_5 = list(current_deque)[-5:] if len(current_deque) >= 5 else []
            if len(recent_5) == 5 and all(v == 1.0 for _, v in recent_5):
                time_diff = now - recent_5[0][0]
                if time_diff < 5.0 and val == 1.0:
                    current_deque.append((now, val))
                    return True, f"Velocity Anomaly: 6 violations in {time_diff:.1f}s (Z-Score: {z_score:.2f})"
        
            # Standard statistical bound
            if z_score > self.threshold and val == 1.0:
                 # Check if the absolute failure rate is also high (e.g. > 50% in the last 10)
                 recent_10 = list(current_deque)[-10:]
                 recent_mean = sum(v for _, v in recent_10) / len(recent_10)
                 if recent_mean > 0.6:
                     current_deque.append((now, val))
                     return True, f"Statistical Anomaly: Violation rate spiked (Z-Score: {z_score:.2f})"

        # Clean append
        current_deque.append((now, val))
        return False, ""

# Singleton instance
anomaly_detector = AnomalyDetector()
