import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { format } from 'date-fns'
import { generateHealthReportPDF } from '@/lib/pdf-generator'

export async function GET(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const days = parseInt(searchParams.get('days') || '7')

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }

    // Get patient
    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        doctor: { select: { name: true, email: true } }
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Check access
    if (user.role === 'DOCTOR' && patient.doctorId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get vitals for the specified period
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    const vitals = await db.vitals.findMany({
      where: {
        patientId,
        recordedAt: { gte: dateThreshold }
      },
      orderBy: { recordedAt: 'asc' }
    })

    // Get alerts for the specified period
    const alerts = await db.alert.findMany({
      where: {
        patientId,
        createdAt: { gte: dateThreshold }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate summary statistics
    const summary = {
      totalReadings: vitals.length,
      avgHeartRate: null as number | null,
      avgSystolic: null as number | null,
      avgDiastolic: null as number | null,
      avgTemperature: null as number | null,
      avgOxygen: null as number | null,
      avgGlucose: null as number | null,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'CRITICAL').length,
      activeAlerts: alerts.filter(a => a.status === 'ACTIVE').length
    }

    if (vitals.length > 0) {
      const heartRates = vitals.map(v => v.heartRate).filter(Boolean) as number[]
      const systolics = vitals.map(v => v.bloodPressureSystolic).filter(Boolean) as number[]
      const diastolics = vitals.map(v => v.bloodPressureDiastolic).filter(Boolean) as number[]
      const temps = vitals.map(v => v.temperature).filter(Boolean) as number[]
      const oxygens = vitals.map(v => v.oxygenSaturation).filter(Boolean) as number[]
      const glucoses = vitals.map(v => v.bloodGlucose).filter(Boolean) as number[]

      if (heartRates.length) summary.avgHeartRate = Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length * 10) / 10
      if (systolics.length) summary.avgSystolic = Math.round(systolics.reduce((a, b) => a + b, 0) / systolics.length * 10) / 10
      if (diastolics.length) summary.avgDiastolic = Math.round(diastolics.reduce((a, b) => a + b, 0) / diastolics.length * 10) / 10
      if (temps.length) summary.avgTemperature = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length * 10) / 10
      if (oxygens.length) summary.avgOxygen = Math.round(oxygens.reduce((a, b) => a + b, 0) / oxygens.length * 10) / 10
      if (glucoses.length) summary.avgGlucose = Math.round(glucoses.reduce((a, b) => a + b, 0) / glucoses.length * 10) / 10
    }

    // Helper for safe JSON parsing
    const safeJsonParse = (data: string | null | undefined): string[] => {
      if (!data) return []
      try {
        const parsed = JSON.parse(data)
        return Array.isArray(parsed) ? parsed : [data]
      } catch (e) {
        // If it's not valid JSON, treat it as a single string entry or comma-separated
        return data.includes(',') ? data.split(',').map(s => s.trim()) : [data]
      }
    }

    // Generate report data
    const report = {
      title: 'Patient Health Report',
      generatedAt: new Date().toISOString(),
      period: `Last ${days} days`,
      patient: {
        name: `${patient.firstName} ${patient.lastName}`,
        dateOfBirth: format(new Date(patient.dateOfBirth), 'yyyy-MM-dd'),
        gender: patient.gender,
        phone: patient.phone || undefined,
        email: patient.email || undefined,
        address: patient.address || undefined,
        emergencyContact: patient.emergencyContact || undefined,
        medicalHistory: safeJsonParse(patient.medicalHistory),
        allergies: safeJsonParse(patient.allergies),
        riskLevel: patient.riskLevel,
        riskScore: patient.riskScore ?? 0,
        doctor: patient.doctor?.name
      },
      summary,
      vitals: vitals.map(v => ({
        date: format(new Date(v.recordedAt), 'yyyy-MM-dd HH:mm'),
        heartRate: v.heartRate || undefined,
        bloodPressure: v.bloodPressureSystolic && v.bloodPressureDiastolic
          ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}`
          : undefined,
        temperature: v.temperature || undefined,
        oxygenSaturation: v.oxygenSaturation || undefined,
        bloodGlucose: v.bloodGlucose || undefined,
        weight: v.weight || undefined
      })),
      alerts: alerts.map(a => ({
        date: format(new Date(a.createdAt), 'yyyy-MM-dd HH:mm'),
        type: a.type,
        severity: a.severity,
        message: a.message,
        status: a.status
      }))
    }

    // Generate PDF
    const pdfBuffer = generateHealthReportPDF(report)

    // Return PDF response
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="health-report-${patient.firstName.toLowerCase()}-${patient.lastName.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf"`
      }
    })
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
