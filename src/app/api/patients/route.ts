import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - List all patients
export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patients = await db.patient.findMany({
      where: {
        isActive: true,
        ...(user.role === 'DOCTOR' ? { doctorId: user.id } : {})
      },
      include: {
        doctor: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { vitals: true, alerts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ patients })
  } catch (error) {
    console.error('Get patients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new patient
export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      emergencyContact,
      medicalHistory,
      allergies,
      doctorId
    } = body

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !gender) {
      return NextResponse.json(
        { error: 'First name, last name, date of birth, and gender are required' },
        { status: 400 }
      )
    }

    const patient = await db.patient.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phone,
        email,
        address,
        emergencyContact,
        medicalHistory: typeof medicalHistory === 'string' ? medicalHistory : JSON.stringify(medicalHistory || []),
        allergies: typeof allergies === 'string' ? allergies : JSON.stringify(allergies || []),
        doctorId: user.role === 'DOCTOR' ? user.id : doctorId
      },
      include: {
        doctor: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({ patient })
  } catch (error) {
    console.error('Create patient error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
