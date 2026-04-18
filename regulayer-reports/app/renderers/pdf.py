"""
Regulayer Reports - PDF Renderer

Pure-Python PDF generation for compliance reports.
Uses fpdf2 (no system dependencies required).
"""

from fpdf import FPDF
from datetime import datetime, timezone
from typing import Any, Dict
import json


class RegulayerPDF(FPDF):
    """Custom PDF with Regulayer branding."""

    def header(self):
        self.set_font('Helvetica', 'B', 14)
        self.cell(0, 10, 'REGULAYER', border=False, align='L')
        self.set_font('Helvetica', '', 8)
        self.cell(0, 10, f'Generated: {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")}', border=False, align='R')
        self.ln(12)
        self.set_draw_color(200, 200, 200)
        self.line(10, self.get_y(), self.w - 10, self.get_y())
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}} | Regulayer Trust Infrastructure', align='C')

    def section_title(self, title: str):
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(30, 30, 30)
        self.cell(0, 10, title, ln=True)
        self.ln(2)

    def section_body(self, text: str):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(60, 60, 60)
        self.multi_cell(0, 6, text)
        self.ln(4)

    def key_value(self, key: str, value: str):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(30, 30, 30)
        self.cell(60, 7, key, ln=False)
        self.set_font('Helvetica', '', 10)
        self.set_text_color(60, 60, 60)
        self.cell(0, 7, str(value), ln=True)


def generate_governance_pdf(data: Dict[str, Any]) -> bytes:
    """Generate Governance Summary PDF."""
    pdf = RegulayerPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.section_title("Governance Summary Report")
    pdf.key_value("Organization:", data.get("organization_id", data.get("org_id", "system")))
    pdf.key_value("Report ID:", data.get("report_id", ""))
    pdf.key_value("Generated:", data.get("generated_at", ""))
    pdf.key_value("Period:", data.get("period", "Trailing 30 Days"))
    pdf.ln(5)

    pdf.section_title("Governance Metrics")
    pdf.key_value("Total Proposals:", str(data.get("total_proposals", data.get("total_flagged", 0))))
    pdf.key_value("Approved:", str(data.get("approved", 0)))
    pdf.key_value("Rejected:", str(data.get("rejected", 0)))
    pdf.key_value("In Review / Escalations:", str(data.get("in_review", data.get("escalations", 0))))
    pdf.ln(5)

    evidence = data.get("evidence_payload", [])
    if isinstance(evidence, list) and len(evidence) > 0:
        pdf.section_title(f"Evidence Records ({len(evidence)} total, showing first 20)")
        for i, item in enumerate(evidence[:20]):
            review_state = item.get("review_state", "pending")
            decision_id = item.get("decision_id", item.get("id", "N/A"))
            summary = f"#{i+1} | Decision: {decision_id} | State: {review_state}"
            pdf.section_body(summary)

    return bytes(pdf.output())


def generate_incidents_pdf(data: Dict[str, Any]) -> bytes:
    """Generate Incident Summary PDF."""
    pdf = RegulayerPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.section_title("Incident Summary Report")
    pdf.key_value("Organization:", data.get("organization_id", data.get("org_id", "system")))
    pdf.key_value("Report ID:", data.get("report_id", ""))
    pdf.key_value("Generated:", data.get("generated_at", ""))
    pdf.ln(5)

    pdf.section_title("Incident Metrics")
    pdf.key_value("Total Incidents:", str(data.get("total_incidents", 0)))
    pdf.key_value("Active Incidents:", str(data.get("active_incidents", 0)))
    pdf.key_value("Resolved:", str(data.get("resolved", data.get("resolved_incidents", 0))))
    pdf.key_value("Critical:", str(data.get("critical", 0)))
    pdf.key_value("Mean Time to Resolution:", f"{data.get('mean_time_to_resolution_hours', 0)} hours")
    pdf.ln(5)

    evidence = data.get("evidence_payload", [])
    if isinstance(evidence, list) and len(evidence) > 0:
        pdf.section_title(f"Incident Records ({len(evidence)} total, showing first 20)")
        for i, item in enumerate(evidence[:20]):
            severity = item.get("severity", "unknown")
            status = item.get("status", "unknown")
            title = item.get("title", item.get("id", "N/A"))
            summary = f"#{i+1} | {title} | Severity: {severity} | Status: {status}"
            pdf.section_body(summary)

    return bytes(pdf.output())


def generate_usage_pdf(data: Dict[str, Any]) -> bytes:
    """Generate Usage Report PDF."""
    pdf = RegulayerPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.section_title("Usage Report")
    pdf.key_value("Organization:", data.get("organization_id", data.get("org_id", "system")))
    pdf.key_value("Report ID:", data.get("report_id", ""))
    pdf.key_value("Generated:", data.get("generated_at", ""))
    pdf.ln(5)

    pdf.section_title("Usage Metrics")
    pdf.key_value("Total Decisions:", str(data.get("total_decisions", data.get("decisions_recorded", 0))))
    pdf.key_value("API Calls:", str(data.get("api_calls", data.get("api_requests", 0))))
    storage_bytes = data.get("storage_bytes", data.get("storage_used_bytes", 0))
    if storage_bytes > 1048576:
        pdf.key_value("Storage Used:", f"{storage_bytes / 1048576:.2f} MB")
    elif storage_bytes > 1024:
        pdf.key_value("Storage Used:", f"{storage_bytes / 1024:.2f} KB")
    else:
        pdf.key_value("Storage Used:", f"{storage_bytes} bytes")

    return bytes(pdf.output())


def generate_sla_pdf(data: Dict[str, Any]) -> bytes:
    """Generate SLA Report PDF."""
    pdf = RegulayerPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.section_title("SLA Compliance Report")
    pdf.key_value("Organization:", data.get("organization_id", data.get("org_id", "system")))
    pdf.key_value("Report ID:", data.get("report_id", ""))
    pdf.key_value("Generated:", data.get("generated_at", ""))
    pdf.ln(5)

    pdf.section_title("Service Level Metrics")
    pdf.key_value("Uptime:", f"{data.get('uptime_percentage', 0)}%")
    pdf.key_value("P95 Latency:", f"{data.get('p95_latency_ms', data.get('p99_latency_ms', 0))} ms")
    pdf.key_value("Avg Governance Queue Time:", f"{data.get('governance_queue_time_avg_minutes', 0)} min")

    return bytes(pdf.output())


def generate_chain_pdf(data: Dict[str, Any]) -> bytes:
    """Generate Chain Integrity Summary PDF."""
    pdf = RegulayerPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.section_title("Chain Integrity Report")
    pdf.key_value("Chain ID:", data.get("chain_id", "default"))
    pdf.key_value("Generated:", datetime.now(timezone.utc).isoformat())
    pdf.ln(5)

    pdf.section_title("Integrity Metrics")
    pdf.key_value("Total Records:", str(data.get("total_records", 0)))
    is_valid = data.get("is_valid", False)
    pdf.key_value("Status:", "Valid and Immutable" if is_valid else "Tampering Detected")
    
    if not is_valid and data.get("broken_at") is not None:
        pdf.key_value("Broken At Record Index:", str(data.get("broken_at")))

    return bytes(pdf.output())
