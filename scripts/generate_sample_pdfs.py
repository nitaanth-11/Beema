"""
Generate Realistic Authentic PDF Documents with Institutional Letterheads.
- California Highway Patrol Traffic Collision Report (Motor)
- Apex Certified Collision Center Invoice (Motor)
- Saint Jude Regional Medical Center Physician Certificate (Health)
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def create_police_report(filepath: str):
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    header_title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#0F294A')
    )
    header_sub_style = ParagraphStyle(
        'HeaderSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#334E68')
    )
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#1E293B')
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1E293B')
    )

    story = []

    # INSTITUTIONAL LETTERHEAD (TOP REGION)
    story.append(Paragraph("STATE OF CALIFORNIA &bull; DEPARTMENT OF HIGHWAY PATROL", header_title_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("CALIFORNIA HIGHWAY PATROL &bull; TRAFFIC COLLISION INVESTIGATION BUREAU", header_title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("SOUTHERN DIVISION &bull; METROPOLITAN AREA COMMAND &bull; OFFICIAL ACCIDENT REPORT", header_sub_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0F294A'), spaceBefore=2, spaceAfter=10))

    # OFFICIAL CASE IDENTIFIER TABLE
    meta_data = [
        [
            Paragraph("<b>OFFICIAL REPORT NO:</b> CHP-2026-88192", body_style),
            Paragraph("<b>INCIDENT DATE:</b> 2026-10-12", body_style),
            Paragraph("<b>TIME:</b> 10:45 AM", body_style)
        ],
        [
            Paragraph("<b>INVESTIGATING OFFICER:</b> Officer M. Bennett", body_style),
            Paragraph("<b>BADGE NO:</b> 4491", body_style),
            Paragraph("<b>PRECINCT:</b> Division 4 Traffic", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[200, 170, 170])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # COLLISION PARTICIPANTS & VEHICLE SPECIFICATIONS
    story.append(Paragraph("SECTION 1: VEHICLE & POLICYHOLDER IDENTIFICATION", section_style))
    story.append(Spacer(1, 6))

    veh_data = [
        [Paragraph("<b>Primary Operator:</b> Alexander Vance", body_style), Paragraph("<b>Driver License:</b> CA-D9182301", body_style)],
        [Paragraph("<b>Vehicle VIN:</b> 1HGCR2F83HA091823", body_style), Paragraph("<b>License Plate:</b> 7XYZ892 (CA)", body_style)],
        [Paragraph("<b>Vehicle Year/Make/Model:</b> 2021 Honda Accord Touring", body_style), Paragraph("<b>Insurance Policy:</b> POL-AUTO-882104", body_style)]
    ]
    veh_table = Table(veh_data, colWidths=[270, 270])
    veh_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(veh_table)
    story.append(Spacer(1, 14))

    # ACCIDENT NARRATIVE & IMPACT CLASSIFICATION
    story.append(Paragraph("SECTION 2: OFFICER NARRATIVE & DAMAGE ASSESSMENT", section_style))
    story.append(Spacer(1, 6))
    narrative_text = (
        "On 2026-10-12 at approx. 10:45 hours, Unit 1 (Vance) was executing a parking deceleration maneuver "
        "when Unit 2 miscalculated clearance and impacted Unit 1's rear bumper assembly and lower trunk fascia. "
        "Physical inspection confirms localized impact deformation to the rear bumper fascia, crumpled trunk lid "
        "alignment, and broken passenger-side tail lamp housing. Vehicle was operable. No injuries sustained. "
        "Damage severity assessed as moderate localized component impact. Official collision report filed."
    )
    story.append(Paragraph(narrative_text, body_style))
    story.append(Spacer(1, 16))

    # CERTIFICATION SEAL & SIGNATURE BLOCK
    cert_data = [
        [
            Paragraph("<b>REPORTING OFFICER:</b><br/>Officer Marcus Bennett, Badge #4491<br/><i>California Highway Patrol</i>", body_style),
            Paragraph("<b>SUPERVISING REVIEWER:</b><br/>Lt. Sarah Sterling, Shield #108<br/><i>State Bureau of Investigation</i>", body_style),
            Paragraph("<b>DEPARTMENT SEAL:</b><br/>[CHP OFFICIAL SEAL CERTIFIED]<br/>STATE ARCHIVE ID: CA-88192-V", body_style)
        ]
    ]
    cert_table = Table(cert_data, colWidths=[180, 180, 180])
    cert_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#0F294A')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(cert_table)

    doc.build(story)
    print(f"Generated Police Report: {filepath}")

def create_repair_invoice(filepath: str):
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    header_title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=18,
        textColor=colors.HexColor('#1E3A8A')
    )
    header_sub_style = ParagraphStyle(
        'HeaderSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#475569')
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1E293B')
    )
    amount_style = ParagraphStyle(
        'Amount',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        alignment=TA_RIGHT,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # INSTITUTIONAL LETTERHEAD
    story.append(Paragraph("APEX CERTIFIED AUTO COLLISION CENTER", header_title_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("OEM Certified Collision Repair Facility &bull; BAR Registration # ARD-291844", header_sub_style))
    story.append(Paragraph("4200 Industrial Parkway, Bay 4 &bull; Tel: (555) 392-8800 &bull; Licensed &amp; Insured", header_sub_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1E3A8A'), spaceBefore=2, spaceAfter=10))

    # INVOICE METADATA
    inv_data = [
        [
            Paragraph("<b>ESTIMATE / INVOICE NO:</b> APX-2026-3198", body_style),
            Paragraph("<b>DATE OF ESTIMATE:</b> 2026-10-12", body_style)
        ],
        [
            Paragraph("<b>CUSTOMER:</b> Alexander Vance", body_style),
            Paragraph("<b>VEHICLE:</b> 2021 Honda Accord (VIN: 1HGCR2F83HA091823)", body_style)
        ]
    ]
    inv_table = Table(inv_data, colWidths=[270, 270])
    inv_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(inv_table)
    story.append(Spacer(1, 14))

    # ITEMIZED REPAIR ESTIMATE (Matching ResNet-18 Detected Components!)
    story.append(Paragraph("<b>ITEMIZED DAMAGE REPAIR &amp; LABOR ESTIMATE</b>", body_style))
    story.append(Spacer(1, 6))

    items = [
        [Paragraph("<b>Component Description</b>", body_style), Paragraph("<b>Operation</b>", body_style), Paragraph("<b>Parts ($)</b>", body_style), Paragraph("<b>Labor ($)</b>", amount_style)],
        [Paragraph("OEM Rear Bumper Cover & Impact Absorber", body_style), Paragraph("Replace & Paint", body_style), Paragraph("$680.00", body_style), Paragraph("$420.00", amount_style)],
        [Paragraph("Trunk Lid Panel / Latch Realignment", body_style), Paragraph("Body Repair & Refinish", body_style), Paragraph("$340.00", body_style), Paragraph("$380.00", amount_style)],
        [Paragraph("Right Passenger Tail Lamp Assembly", body_style), Paragraph("OEM Replacement", body_style), Paragraph("$290.00", body_style), Paragraph("$110.00", amount_style)],
        [Paragraph("Parking Sensor Calibration & Scan", body_style), Paragraph("Diagnostics & Re-aim", body_style), Paragraph("$0.00", body_style), Paragraph("$100.00", amount_style)],
        [Paragraph("<b>TOTAL REPAIR ESTIMATE:</b>", body_style), Paragraph("<b>APPROVED FAIR TOTAL</b>", body_style), Paragraph("", body_style), Paragraph("<b>$2,320.00</b>", amount_style)]
    ]
    item_table = Table(items, colWidths=[230, 130, 90, 90])
    item_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EFF6FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#93C5FD')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#BFDBFE')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#ECFDF5')),
    ]))
    story.append(item_table)
    story.append(Spacer(1, 16))

    # CERTIFIED APPRAISER STAMP
    stamp_data = [
        [
            Paragraph("<b>CERTIFIED APPRAISER:</b><br/>David Vance, Master Estimator #ME-8821<br/><i>ASE Certified &bull; I-CAR Gold Class</i>", body_style),
            Paragraph("<b>PAYMENT GUARANTEE:</b><br/>All parts OEM certified.<br/>Direct insurer billing authorized.", body_style)
        ]
    ]
    stamp_table = Table(stamp_data, colWidths=[270, 270])
    stamp_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#1E3A8A')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(stamp_table)

    doc.build(story)
    print(f"Generated Repair Invoice: {filepath}")

def create_medical_report(filepath: str):
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    header_title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#065F46')
    )
    header_sub_style = ParagraphStyle(
        'HeaderSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#047857')
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1E293B')
    )

    story = []

    # INSTITUTIONAL LETTERHEAD
    story.append(Paragraph("SAINT JUDE REGIONAL MEDICAL CENTER", header_title_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("DEPARTMENT OF EMERGENCY MEDICINE & INPATIENT SERVICES &bull; ACCREDITED JCAHO", header_sub_style))
    story.append(Paragraph("1000 Hospital Drive, Pavilion B &bull; Tel: (555) 880-1200 &bull; State Health License # MED-99210", header_sub_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#065F46'), spaceBefore=2, spaceAfter=10))

    # MEDICAL RECORD INFO
    med_data = [
        [Paragraph("<b>PATIENT NAME:</b> Alexander Vance", body_style), Paragraph("<b>MRN / RECORD NO:</b> HOSP-2026-99214", body_style)],
        [Paragraph("<b>DATE OF SERVICE:</b> 2026-10-12", body_style), Paragraph("<b>POLICY NUMBER:</b> POL-HLTH-771920", body_style)],
        [Paragraph("<b>ATTENDING PHYSICIAN:</b> Dr. Robert Sterling, M.D.", body_style), Paragraph("<b>PHYSICIAN NPI:</b> 1849201948", body_style)]
    ]
    med_table = Table(med_data, colWidths=[270, 270])
    med_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ECFDF5')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#A7F3D0')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(med_table)
    story.append(Spacer(1, 14))

    # DIAGNOSIS & ITEMIZED BILLING
    items = [
        [Paragraph("<b>Clinical Service / Procedure</b>", body_style), Paragraph("<b>ICD / CPT Code</b>", body_style), Paragraph("<b>Amount ($)</b>", body_style)],
        [Paragraph("Emergency Evaluation & Triage Assessment", body_style), Paragraph("CPT 99285", body_style), Paragraph("$950.00", body_style)],
        [Paragraph("Diagnostic Cervical Spine CT Imaging", body_style), Paragraph("CPT 70450", body_style), Paragraph("$1,450.00", body_style)],
        [Paragraph("Inpatient Observation Care (24-Hour)", body_style), Paragraph("CPT 99219", body_style), Paragraph("$1,050.00", body_style)],
        [Paragraph("<b>TOTAL ITEMIZABLE MEDICAL CHARGES:</b>", body_style), Paragraph("<b>ICD-10 S13.4XXA</b>", body_style), Paragraph("<b>$3,450.00</b>", body_style)]
    ]
    item_table = Table(items, colWidths=[270, 140, 130])
    item_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F0FDF4')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#6EE7B7')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#A7F3D0')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#D1FAE5')),
    ]))
    story.append(item_table)

    doc.build(story)
    print(f"Generated Medical Report: {filepath}")

if __name__ == "__main__":
    os.makedirs("frontend/public", exist_ok=True)
    create_police_report("frontend/public/sample_police_report.pdf")
    create_repair_invoice("frontend/public/sample_repair_invoice.pdf")
    create_medical_report("frontend/public/sample_medical_bill.pdf")
    print("All sample authentic PDFs created successfully!")
