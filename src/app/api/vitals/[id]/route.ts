import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get vitals by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const vitals = await db.vitals.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            doctorId: true
          }
        }
      }
    })

    if (!vitals) {
      return NextResponse.json({ error: 'Vitals record not found' }, { status: 404 })
    }

    // Check access
    if (user.role === 'DOCTOR' && vitals.patient.doctorId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ vitals })
  } catch (error) {
    console.error('Get vitals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete vitals record
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const vitals = await db.vitals.findUnique({
      where: { id },
      include: { patient: { select: { doctorId: true } } }
    })

    if (!vitals) {
      return NextResponse.json({ error: 'Vitals record not found' }, { status: 404 })
    }

    // Check access
    if (user.role === 'DOCTOR' && vitals.patient.doctorId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await db.vitals.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete vitals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
