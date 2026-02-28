import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { checkThresholds } from '@/lib/thresholds'

// GET - Get vitals (with filters)
export async function GET(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const days = parseInt(searchParams.get('days') || '7')

    const whereClause: { patientId?: string; patient?: { doctorId?: string } } = {}
    
    if (patientId) {
      whereClause.patientId = patientId
    }
    
    if (user.role === 'DOCTOR') {
      whereClause.patient = { doctorId: user.id }
    }

    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    const vitals = await db.vitals.findMany({
      where: {
        ...whereClause,
        recordedAt: {
          gte: dateThreshold
        }
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { recordedAt: 'desc' }
    })

    return NextResponse.json({ vitals })
  } catch (error) {
    console.error('Get vitals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new vitals record
export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      patientId,
      heartRate,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      temperature,
      oxygenSaturation,
      respiratoryRate,
      bloodGlucose,
      weight,
      height,
      notes
    } = body

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      )
    }

    // Check patient access
    const patient = await db.patient.findUnique({ where: { id: patientId } })
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    if (user.role === 'DOCTOR' && patient.doctorId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create vitals record
    const vitals = await db.vitals.create({
      data: {
        patientId,
        heartRate: heartRate ? parseFloat(heartRate) : null,
        bloodPressureSystolic: bloodPressureSystolic ? parseFloat(bloodPressureSystolic) : null,
        bloodPressureDiastolic: bloodPressureDiastolic ? parseFloat(bloodPressureDiastolic) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        oxygenSaturation: oxygenSaturation ? parseFloat(oxygenSaturation) : null,
        respiratoryRate: respiratoryRate ? parseFloat(respiratoryRate) : null,
        bloodGlucose: bloodGlucose ? parseFloat(bloodGlucose) : null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        notes
      }
    })

    // Check thresholds and create alerts
    await checkThresholds(vitals, patient)

    return NextResponse.json({ vitals })
  } catch (error) {
    console.error('Create vitals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
