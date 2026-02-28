import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST() {
  try {
    // We use upsert to ensure all credentials (legacy, medpulse.ai, healthmonitor.com) are always present even if database was partially seeded.

    // Create legacy and medpulse.ai credentials
    const hashedPassword = await hashPassword('admin123')
    const doctorPassword = await hashPassword('doctor123')

    // Admin variations
    await db.user.upsert({
      where: { email: 'admin' },
      update: {},
      create: {
        email: 'admin',
        password: hashedPassword,
        name: 'Legacy Admin',
        role: 'ADMIN'
      }
    })

    await db.user.upsert({
      where: { email: 'admin@medpulse.ai' },
      update: {},
      create: {
        email: 'admin@medpulse.ai',
        password: hashedPassword,
        name: 'MedPulse Admin',
        role: 'ADMIN'
      }
    })

    await db.user.upsert({
      where: { email: 'admin@healthmonitor.com' },
      update: {},
      create: {
        email: 'admin@healthmonitor.com',
        password: hashedPassword,
        name: 'System Admin',
        role: 'ADMIN'
      }
    })

    // Doctor variations
    await db.user.upsert({
      where: { email: 'dr.smith' },
      update: {},
      create: {
        email: 'dr.smith',
        password: doctorPassword,
        name: 'Legacy Dr. Smith',
        role: 'DOCTOR'
      }
    })

    await db.user.upsert({
      where: { email: 'dr.smith@medpulse.ai' },
      update: {},
      create: {
        email: 'dr.smith@medpulse.ai',
        password: doctorPassword,
        name: 'MedPulse Dr. Smith',
        role: 'DOCTOR'
      }
    })

    const doctor1 = await db.user.upsert({
      where: { email: 'dr.smith@healthmonitor.com' },
      update: {},
      create: {
        email: 'dr.smith@healthmonitor.com',
        password: doctorPassword,
        name: 'Dr. John Smith',
        role: 'DOCTOR'
      }
    })

    const doctor2 = await db.user.upsert({
      where: { email: 'dr.johnson@healthmonitor.com' },
      update: {},
      create: {
        email: 'dr.johnson@healthmonitor.com',
        password: doctorPassword,
        name: 'Dr. Sarah Johnson',
        role: 'DOCTOR'
      }
    })

    // Create sample patients
    const patients = await Promise.all([
      db.patient.create({
        data: {
          firstName: 'Michael',
          lastName: 'Brown',
          dateOfBirth: new Date('1985-03-15'),
          gender: 'MALE',
          phone: '555-0101',
          email: 'michael.brown@email.com',
          address: '123 Main St, City, ST 12345',
          emergencyContact: 'Jane Brown - 555-0102',
          medicalHistory: JSON.stringify(['Hypertension', 'Type 2 Diabetes']),
          allergies: JSON.stringify(['Penicillin']),
          doctorId: doctor1.id,
          riskLevel: 'MEDIUM',
          riskScore: 35
        }
      }),
      db.patient.create({
        data: {
          firstName: 'Emily',
          lastName: 'Davis',
          dateOfBirth: new Date('1990-07-22'),
          gender: 'FEMALE',
          phone: '555-0201',
          email: 'emily.davis@email.com',
          address: '456 Oak Ave, Town, ST 67890',
          emergencyContact: 'Robert Davis - 555-0202',
          medicalHistory: JSON.stringify(['Asthma']),
          allergies: JSON.stringify(['Sulfa drugs', 'Latex']),
          doctorId: doctor1.id,
          riskLevel: 'LOW',
          riskScore: 15
        }
      }),
      db.patient.create({
        data: {
          firstName: 'James',
          lastName: 'Wilson',
          dateOfBirth: new Date('1970-11-08'),
          gender: 'MALE',
          phone: '555-0301',
          email: 'james.wilson@email.com',
          address: '789 Pine Rd, Village, ST 11111',
          emergencyContact: 'Mary Wilson - 555-0302',
          medicalHistory: JSON.stringify(['Coronary Artery Disease', 'High Cholesterol']),
          allergies: JSON.stringify([]),
          doctorId: doctor2.id,
          riskLevel: 'HIGH',
          riskScore: 65
        }
      }),
      db.patient.create({
        data: {
          firstName: 'Sarah',
          lastName: 'Miller',
          dateOfBirth: new Date('1995-01-30'),
          gender: 'FEMALE',
          phone: '555-0401',
          email: 'sarah.miller@email.com',
          address: '321 Elm St, Metro, ST 22222',
          emergencyContact: 'Tom Miller - 555-0402',
          medicalHistory: JSON.stringify([]),
          allergies: JSON.stringify(['Aspirin']),
          doctorId: doctor2.id,
          riskLevel: 'LOW',
          riskScore: 10
        }
      }),
      db.patient.create({
        data: {
          firstName: 'Robert',
          lastName: 'Taylor',
          dateOfBirth: new Date('1960-05-18'),
          gender: 'MALE',
          phone: '555-0501',
          email: 'robert.taylor@email.com',
          address: '654 Birch Ln, County, ST 33333',
          emergencyContact: 'Linda Taylor - 555-0502',
          medicalHistory: JSON.stringify(['Chronic Kidney Disease', 'Anemia']),
          allergies: JSON.stringify(['Contrast dye']),
          doctorId: doctor1.id,
          riskLevel: 'CRITICAL',
          riskScore: 80
        }
      })
    ])

    // Create sample vitals for each patient (last 7 days)
    const now = new Date()
    for (const patient of patients) {
      for (let i = 0; i < 7; i++) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        date.setHours(9, 0, 0, 0)

        // Generate vitals based on risk level
        const isHighRisk = patient.riskLevel === 'HIGH' || patient.riskLevel === 'CRITICAL'
        const isMediumRisk = patient.riskLevel === 'MEDIUM'

        await db.vitals.create({
          data: {
            patientId: patient.id,
            heartRate: isHighRisk ? 85 + Math.random() * 30 : 65 + Math.random() * 20,
            bloodPressureSystolic: isHighRisk ? 135 + Math.random() * 25 : 110 + Math.random() * 20,
            bloodPressureDiastolic: isHighRisk ? 85 + Math.random() * 15 : 70 + Math.random() * 10,
            temperature: 36.2 + Math.random() * 1.2,
            oxygenSaturation: isHighRisk ? 92 + Math.random() * 5 : 96 + Math.random() * 3,
            respiratoryRate: isMediumRisk ? 16 + Math.random() * 6 : 14 + Math.random() * 4,
            bloodGlucose: isHighRisk ? 140 + Math.random() * 60 : 85 + Math.random() * 30,
            weight: patient.gender === 'MALE' ? 75 + Math.random() * 15 : 60 + Math.random() * 15,
            recordedAt: date
          }
        })
      }
    }

    // Create sample alerts
    await db.alert.create({
      data: {
        patientId: patients[4].id, // Robert Taylor (critical patient)
        type: 'BLOOD_PRESSURE',
        severity: 'CRITICAL',
        message: 'Critical high systolic BP: 165 mmHg',
        value: 165,
        threshold: 140,
        status: 'ACTIVE'
      }
    })

    await db.alert.create({
      data: {
        patientId: patients[4].id,
        type: 'GLUCOSE',
        severity: 'HIGH',
        message: 'High blood glucose: 195 mg/dL',
        value: 195,
        threshold: 140,
        status: 'ACTIVE'
      }
    })

    await db.alert.create({
      data: {
        patientId: patients[2].id, // James Wilson (high risk)
        type: 'HEART_RATE',
        severity: 'HIGH',
        message: 'High heart rate: 108 bpm',
        value: 108,
        threshold: 100,
        status: 'ACTIVE'
      }
    })

    // Create system settings
    await db.systemSettings.create({ data: {} })

    return NextResponse.json({
      message: 'Database seeded successfully',
      users: { admin: 1, doctors: 2 },
      patients: patients.length
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
