import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'

interface PatientInfo {
  name: string
  dateOfBirth: string
  gender: string
  phone?: string
  email?: string
  address?: string
  emergencyContact?: string
  medicalHistory: string[]
  allergies: string[]
  riskLevel: string
  riskScore: number
  doctor?: string
}

interface VitalsRecord {
  date: string
  heartRate?: number
  bloodPressure?: string
  temperature?: number
  oxygenSaturation?: number
  bloodGlucose?: number
  weight?: number
}

interface AlertRecord {
  date: string
  type: string
  severity: string
  message: string
  status: string
}

interface ReportData {
  title: string
  generatedAt: string
  period: string
  patient: PatientInfo
  summary: {
    totalReadings: number
    avgHeartRate: number | null
    avgSystolic: number | null
    avgDiastolic: number | null
    avgTemperature: number | null
    avgOxygen: number | null
    avgGlucose: number | null
    totalAlerts: number
    criticalAlerts: number
    activeAlerts: number
  }
  vitals: VitalsRecord[]
  alerts: AlertRecord[]
}

// Helper to get lastAutoTable Y position safely
function getLastY(doc: jsPDF): number {
  return (doc as any).lastAutoTable?.finalY ?? 20
}

export function generateHealthReportPDF(report: ReportData): Buffer {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPos = 20

  // ── HEADER ──────────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, pageWidth, 36, 'F')

  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(96, 165, 250) // blue-400
  doc.text('MedPulse', 14, 16)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184) // slate-400
  doc.text('Patient Health Report', 14, 24)

  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139) // slate-500
  doc.text(`Generated: ${format(new Date(report.generatedAt), 'PPpp')}`, pageWidth - 14, 16, { align: 'right' })
  doc.text(`Period: ${report.period}`, pageWidth - 14, 24, { align: 'right' })

  // Line separator
  doc.setDrawColor(51, 65, 85)
  doc.line(0, 36, pageWidth, 36)
  yPos = 48

  // ── PATIENT INFORMATION ──────────────────────────────────────────────────────
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(96, 165, 250)
  doc.text('Patient Information', 14, yPos)
  yPos += 6

  const patientInfo = [
    ['Name:', report.patient.name],
    ['Date of Birth:', report.patient.dateOfBirth],
    ['Gender:', report.patient.gender],
    ['Phone:', report.patient.phone || 'N/A'],
    ['Email:', report.patient.email || 'N/A'],
    ['Emergency Contact:', report.patient.emergencyContact || 'N/A'],
    ['Attending Physician:', report.patient.doctor || 'N/A'],
    ['Medical History:', report.patient.medicalHistory.length > 0 ? report.patient.medicalHistory.join(', ') : 'None recorded'],
    ['Allergies:', report.patient.allergies.length > 0 ? report.patient.allergies.join(', ') : 'None recorded'],
  ]

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: patientInfo,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, textColor: [30, 41, 59] },
      1: { cellWidth: 'auto', textColor: [71, 85, 105] }
    }
  })
  yPos = getLastY(doc) + 8

  // ── RISK ASSESSMENT ─────────────────────────────────────────────────────────
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(96, 165, 250)
  doc.text('Risk Assessment', 14, yPos)
  yPos += 6

  const riskColors: Record<string, [number, number, number]> = {
    CRITICAL: [239, 68, 68],
    HIGH: [249, 115, 22],
    MEDIUM: [234, 179, 8],
    LOW: [16, 185, 129]
  }
  const riskColor = riskColors[report.patient.riskLevel] ?? [107, 114, 128]
  const riskBg = riskColors[report.patient.riskLevel]

  // Risk badge
  doc.setFillColor(...riskBg)
  doc.roundedRect(14, yPos - 4, 35, 10, 3, 3, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(report.patient.riskLevel, 31.5, yPos + 2.5, { align: 'center' })

  doc.setFontSize(9)
  doc.setTextColor(51, 65, 85)
  doc.setFont('helvetica', 'normal')
  doc.text(`Risk Score: ${Math.round(report.patient.riskScore)}%`, 55, yPos + 2)
  yPos += 16

  // ── SUMMARY STATISTICS ───────────────────────────────────────────────────────
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(96, 165, 250)
  doc.text('Summary Statistics', 14, yPos)
  yPos += 5

  const summaryData = [
    ['Total Readings', report.summary.totalReadings.toString()],
    ['Avg. Heart Rate', report.summary.avgHeartRate ? `${report.summary.avgHeartRate.toFixed(1)} bpm` : 'N/A'],
    ['Avg. Blood Pressure', report.summary.avgSystolic && report.summary.avgDiastolic ?
      `${report.summary.avgSystolic.toFixed(0)}/${report.summary.avgDiastolic.toFixed(0)} mmHg` : 'N/A'],
    ['Avg. Temperature', report.summary.avgTemperature ? `${report.summary.avgTemperature.toFixed(1)}°C` : 'N/A'],
    ['Avg. SpO₂', report.summary.avgOxygen ? `${report.summary.avgOxygen.toFixed(1)}%` : 'N/A'],
    ['Avg. Blood Glucose', report.summary.avgGlucose ? `${report.summary.avgGlucose.toFixed(1)} mg/dL` : 'N/A'],
    ['Total Alerts', report.summary.totalAlerts.toString()],
    ['Critical Alerts', report.summary.criticalAlerts.toString()],
    ['Active Alerts', report.summary.activeAlerts.toString()],
  ]

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 138], fontSize: 9, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: 'bold', textColor: [30, 41, 59] },
      1: { cellWidth: 'auto', textColor: [71, 85, 105] }
    }
  })
  yPos = getLastY(doc) + 10

  // Page break if needed
  if (yPos > pageHeight - 60) {
    doc.addPage()
    yPos = 20
  }

  // ── VITALS RECORDS ────────────────────────────────────────────────────────────
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(96, 165, 250)
  doc.text('Vitals Records', 14, yPos)
  yPos += 5

  if (report.vitals.length === 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(148, 163, 184)
    doc.text('No vitals recorded for this period.', 14, yPos + 6)
    yPos += 16
  } else {
    const vitalsData = report.vitals.map(v => [
      v.date,
      v.heartRate?.toFixed(0) || '-',
      v.bloodPressure || '-',
      v.temperature?.toFixed(1) || '-',
      v.oxygenSaturation?.toFixed(0) || '-',
      v.bloodGlucose?.toFixed(0) || '-',
      v.weight?.toFixed(1) || '-'
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Date/Time', 'HR (bpm)', 'BP (mmHg)', 'Temp (°C)', 'SpO₂ (%)', 'Glucose', 'Weight (kg)']],
      body: vitalsData,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], fontSize: 8, textColor: [255, 255, 255], cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8, cellPadding: 3, textColor: [51, 65, 85] },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 19, halign: 'center' },
        2: { cellWidth: 24, halign: 'center' },
        3: { cellWidth: 19, halign: 'center' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 22, halign: 'center' }
      }
    })
    yPos = getLastY(doc) + 10
  }

  // Page break if needed
  if (yPos > pageHeight - 60 && report.alerts.length > 0) {
    doc.addPage()
    yPos = 20
  }

  // ── ALERTS ───────────────────────────────────────────────────────────────────
  if (report.alerts.length > 0) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(239, 68, 68)
    doc.text('Clinical Alerts', 14, yPos)
    yPos += 5

    const alertsData = report.alerts.map(a => [
      a.date,
      a.type.replace(/_/g, ' '),
      a.severity,
      a.message,
      a.status
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Date/Time', 'Type', 'Severity', 'Message', 'Status']],
      body: alertsData,
      theme: 'grid',
      headStyles: { fillColor: [127, 29, 29], fontSize: 8, textColor: [255, 255, 255], cellPadding: 3 },
      styles: { fontSize: 8, cellPadding: 3, textColor: [51, 65, 85] },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 22, halign: 'center' }
      },
      didParseCell: function (data) {
        if (data.column.index === 2 && data.section === 'body') {
          const severity = data.cell.raw as string
          if (severity === 'CRITICAL') {
            data.cell.styles.textColor = [239, 68, 68]
            data.cell.styles.fontStyle = 'bold'
          } else if (severity === 'HIGH') {
            data.cell.styles.textColor = [249, 115, 22]
            data.cell.styles.fontStyle = 'bold'
          } else if (severity === 'MEDIUM') {
            data.cell.styles.textColor = [202, 138, 4]
          }
        }
      }
    })
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(15, 23, 42)
    doc.rect(0, pageHeight - 16, pageWidth, 16, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(
      `MedPulse AI — Smart Remote Health Monitoring  |  ${format(new Date(), 'PP')}  |  Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    )
  }

  return Buffer.from(doc.output('arraybuffer'))
}
