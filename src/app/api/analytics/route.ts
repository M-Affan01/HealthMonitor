import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date ranges
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Base filter for doctors
    const patientFilter = user.role === 'DOCTOR' ? { doctorId: user.id } : {}
    const isActive = { isActive: true }

    // Patient statistics
    const totalPatients = await db.patient.count({
      where: { ...isActive, ...patientFilter }
    })

    const patientsByRiskLevel = await db.patient.groupBy({
      by: ['riskLevel'],
      where: { ...isActive, ...patientFilter },
      _count: true
    })

    // Alert statistics
    const activeAlerts = await db.alert.count({
      where: {
        status: 'ACTIVE',
        patient: patientFilter
      }
    })

    const alertsBySeverity = await db.alert.groupBy({
      by: ['severity'],
      where: {
        createdAt: { gte: sevenDaysAgo },
        patient: patientFilter
      },
      _count: true
    })

    const alertsByType = await db.alert.groupBy({
      by: ['type'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        patient: patientFilter
      },
      _count: true
    })

    // Vitals statistics (last 30 days)
    const totalVitals = await db.vitals.count({
      where: {
        recordedAt: { gte: thirtyDaysAgo },
        patient: patientFilter
      }
    })

    // Vitals trend data (last 7 days, grouped by day)
    const vitalsRecords = await db.vitals.findMany({
      where: {
        recordedAt: { gte: sevenDaysAgo },
        patient: patientFilter
      },
      select: {
        recordedAt: true,
        heartRate: true,
        bloodPressureSystolic: true,
        temperature: true,
        oxygenSaturation: true,
        bloodGlucose: true
      },
      orderBy: { recordedAt: 'asc' }
    })

    // Group vitals by day
    const vitalsByDay: Record<string, {
      date: string
      count: number
      avgHeartRate: number[]
      avgSystolic: number[]
      avgTemp: number[]
      avgOxygen: number[]
      avgGlucose: number[]
    }> = {}

    vitalsRecords.forEach(v => {
      const dateKey = v.recordedAt.toISOString().split('T')[0]
      if (!vitalsByDay[dateKey]) {
        vitalsByDay[dateKey] = {
          date: dateKey,
          count: 0,
          avgHeartRate: [],
          avgSystolic: [],
          avgTemp: [],
          avgOxygen: [],
          avgGlucose: []
        }
      }
      vitalsByDay[dateKey].count++
      if (v.heartRate) vitalsByDay[dateKey].avgHeartRate.push(v.heartRate)
      if (v.bloodPressureSystolic) vitalsByDay[dateKey].avgSystolic.push(v.bloodPressureSystolic)
      if (v.temperature) vitalsByDay[dateKey].avgTemp.push(v.temperature)
      if (v.oxygenSaturation) vitalsByDay[dateKey].avgOxygen.push(v.oxygenSaturation)
      if (v.bloodGlucose) vitalsByDay[dateKey].avgGlucose.push(v.bloodGlucose)
    })

    const vitalsTrend = Object.values(vitalsByDay).map(day => ({
      date: day.date,
      count: day.count,
      avgHeartRate: day.avgHeartRate.length > 0
        ? day.avgHeartRate.reduce((a, b) => a + b, 0) / day.avgHeartRate.length
        : null,
      avgSystolic: day.avgSystolic.length > 0
        ? day.avgSystolic.reduce((a, b) => a + b, 0) / day.avgSystolic.length
        : null,
      avgTemp: day.avgTemp.length > 0
        ? day.avgTemp.reduce((a, b) => a + b, 0) / day.avgTemp.length
        : null,
      avgOxygen: day.avgOxygen.length > 0
        ? day.avgOxygen.reduce((a, b) => a + b, 0) / day.avgOxygen.length
        : null,
      avgGlucose: day.avgGlucose.length > 0
        ? day.avgGlucose.reduce((a, b) => a + b, 0) / day.avgGlucose.length
        : null
    }))

    // Recent alerts
    const recentAlerts = await db.alert.findMany({
      where: {
        status: 'ACTIVE',
        patient: patientFilter
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Users count (admin only)
    let totalDoctors = 0
    if (user.role === 'ADMIN') {
      totalDoctors = await db.user.count({
        where: { role: 'DOCTOR' }
      })
    }

    return NextResponse.json({
      overview: {
        totalPatients,
        activeAlerts,
        totalVitals,
        totalDoctors
      },
      patientsByRiskLevel,
      alertsBySeverity,
      alertsByType,
      vitalsTrend,
      recentAlerts
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
