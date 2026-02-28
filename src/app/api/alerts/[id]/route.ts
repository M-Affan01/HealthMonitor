import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT - Update alert (acknowledge/resolve)
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    const alert = await db.alert.findUnique({
      where: { id },
      include: { patient: { select: { doctorId: true } } }
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    // Check access
    if (user.role === 'DOCTOR' && alert.patient.doctorId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = { status }
    
    if (status === 'ACKNOWLEDGED') {
      updateData.acknowledgedBy = user.id
      updateData.acknowledgedAt = new Date()
    } else if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date()
    }

    const updatedAlert = await db.alert.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true }
        },
        acknowledgedUser: {
          select: { id: true, name: true }
        }
      }
    })

    // Update patient risk score
    const { updatePatientRiskScore } = await import('@/lib/thresholds')
    await updatePatientRiskScore(alert.patientId)

    return NextResponse.json({ alert: updatedAlert })
  } catch (error) {
    console.error('Update alert error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
