import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - Get alerts (with filters)
export async function GET(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const days = parseInt(searchParams.get('days') || '7')

    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    const whereClause: Record<string, unknown> = {
      createdAt: { gte: dateThreshold }
    }
    
    if (patientId) whereClause.patientId = patientId
    if (status) whereClause.status = status
    if (severity) whereClause.severity = severity
    
    if (user.role === 'DOCTOR') {
      whereClause.patient = { doctorId: user.id }
    }

    const alerts = await db.alert.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        acknowledgedUser: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Get alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
