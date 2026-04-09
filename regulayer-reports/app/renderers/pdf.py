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
    pdf.key_value("Organization:", data.get("org_id", "system"))
    pdf.key_value("Generated:", data.get("generated_at", ""))
    pdf.ln(5)

    pdf.section_title("Metrics")
    pdf.key_value("Total Proposals:", str(data.get("total_proposals", 0)))
    pdf.key_value("Approved:", str(data.get("approved", 0)))
    pdf.key_value("Rejected:", str(data.get("rejected", 0)))
    pdf.key_value("In Review:", str(data.get("in_review", 0)))
    pdf.ln(5)

    evidence = data.get("evidence_payload", [])
    if isinstance(evidence, list) and len(evidence) > 0:
        pdf.section_title(f"Evidence ({len(evidence)} records)")
        for i, item in enumerate(evidence[:20]):  # Cap at 20
            pdf.section_body(f"#{i+1}: {json.dumps(item, default=str)[:200]}")

    return pdf.output()


def generate_incidents_pdf(data: Dict[str, Any]) -> bytes:
    """Generate Incident Summary PDF."""
    pdf = RegulayerPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.section_title("Incident Summary Report")
    pdf.key_value("Organization:", data.get("org_id", "system"))
    pdf.key_value("Generated:", data.get("generated_at", ""))
    pdf.ln(5)

    pdf.section_title("Metrics")
    pdf.key_value("Total Incidents:", str(data.get("total_incidents", 0)))
    pdf.key_value("Critical:", str(data.get("critical", 0)))
    pdf.key_value("Resolved:", str(data.get("resolved", 0)))
    pdf.ln(5)

    evidence = data.get("evidence_payload", [])
    if isinstance(evidence, list) and len(evidence) > 0:
        pdf.section_title(f"Incident Records ({len(evidence)})")
        for i, item in enumerate(evidence[:20]):
            pdf.section_body(f"#{i+1}: {json.dumps(item, default=str)[:200]}")

    return pdf.output()


def generate_usage_pdf(data: Dict[str, Any]) -> bytes:
    """Generate Usage Report PDF."""
    pdf = RegulayerPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.section_title("Usage Report")
    pdf.key_value("Organization:", data.get("org_id", "system"))
    pdf.key_value("Generated:", data.get("generated_at", ""))
    pdf.ln(5)

    pdf.section_title("Usage Metrics")
    pdf.key_value("Total Decisions:", str(data.get("total_decisions", 0)))
    pdf.key_value("API Calls:", str(data.get("api_calls", 0)))
    pdf.key_value("Storage (bytes):", str(data.get("storage_bytes", 0)))

    return pdf.output()


def generate_sla_pdf(data: Dict[str, Any]) -> bytes:
    """Generate SLA Report PDF."""
    pdf = RegulayerPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.section_title("SLA Compliance Report")
    pdf.key_value("Organization:", data.get("org_id", "system"))
    pdf.key_value("Generated:", data.get("generated_at", ""))
    pdf.ln(5)

    pdf.section_title("Service Level Metrics")
    pdf.key_value("Uptime:", f"{data.get('uptime_percentage', 0)}%")
    pdf.key_value("P99 Latency:", f"{data.get('p99_latency_ms', 0)} ms")

    return pdf.output()
