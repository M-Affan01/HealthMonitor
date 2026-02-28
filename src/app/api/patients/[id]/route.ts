import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get patient by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const patient = await db.patient.findUnique({
      where: { id },
      include: {
        doctor: {
          select: { id: true, name: true, email: true }
        },
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 10
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Check access
    if (user.role === 'DOCTOR' && patient.doctorId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ patient })
  } catch (error) {
    console.error('Get patient error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update patient
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existingPatient = await db.patient.findUnique({ where: { id } })
    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Check access
    if (user.role === 'DOCTOR' && existingPatient.doctorId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}
    
    const allowedFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'phone', 
      'email', 'address', 'emergencyContact', 'medicalHistory', 
      'allergies', 'doctorId', 'riskScore', 'riskLevel', 'isActive'
    ]
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'dateOfBirth') {
          updateData[field] = new Date(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const patient = await db.patient.update({
      where: { id },
      data: updateData,
      include: {
        doctor: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({ patient })
  } catch (error) {
    console.error('Update patient error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Soft delete patient
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existingPatient = await db.patient.findUnique({ where: { id } })
    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Check access
    if (user.role === 'DOCTOR' && existingPatient.doctorId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Soft delete
    await db.patient.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete patient error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
