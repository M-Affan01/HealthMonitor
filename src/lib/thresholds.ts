import { db } from './db'

interface VitalsData {
  id: string
  heartRate: number | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  temperature: number | null
  oxygenSaturation: number | null
  bloodGlucose: number | null
}

interface PatientData {
  id: string
  firstName: string
  lastName: string
}

interface ThresholdSettings {
  heartRateMinLow: number
  heartRateMinCritical: number
  heartRateMaxLow: number
  heartRateMaxCritical: number
  bpSystolicMinLow: number
  bpSystolicMinCritical: number
  bpSystolicMaxLow: number
  bpSystolicMaxCritical: number
  bpDiastolicMinLow: number
  bpDiastolicMinCritical: number
  bpDiastolicMaxLow: number
  bpDiastolicMaxCritical: number
  tempMinLow: number
  tempMinCritical: number
  tempMaxLow: number
  tempMaxCritical: number
  oxygenMinLow: number
  oxygenMinCritical: number
  glucoseMinLow: number
  glucoseMinCritical: number
  glucoseMaxLow: number
  glucoseMaxCritical: number
}

// Get threshold settings
export async function getThresholdSettings(): Promise<ThresholdSettings> {
  let settings = await db.systemSettings.findFirst()
  
  if (!settings) {
    // Create default settings
    settings = await db.systemSettings.create({
      data: {}
    })
  }
  
  return settings
}

// Check thresholds and create alerts
export async function checkThresholds(vitals: VitalsData, patient: PatientData): Promise<void> {
  const settings = await getThresholdSettings()
  
  // Heart Rate
  if (vitals.heartRate !== null) {
    if (vitals.heartRate < settings.heartRateMinCritical) {
      await createAlert(patient, 'HEART_RATE', 'CRITICAL', 
        `Critical low heart rate: ${vitals.heartRate} bpm`, 
        vitals.heartRate, settings.heartRateMinCritical)
    } else if (vitals.heartRate < settings.heartRateMinLow) {
      await createAlert(patient, 'HEART_RATE', 'HIGH',
        `Low heart rate: ${vitals.heartRate} bpm`,
        vitals.heartRate, settings.heartRateMinLow)
    } else if (vitals.heartRate > settings.heartRateMaxCritical) {
      await createAlert(patient, 'HEART_RATE', 'CRITICAL',
        `Critical high heart rate: ${vitals.heartRate} bpm`,
        vitals.heartRate, settings.heartRateMaxCritical)
    } else if (vitals.heartRate > settings.heartRateMaxLow) {
      await createAlert(patient, 'HEART_RATE', 'HIGH',
        `High heart rate: ${vitals.heartRate} bpm`,
        vitals.heartRate, settings.heartRateMaxLow)
    }
  }
  
  // Blood Pressure Systolic
  if (vitals.bloodPressureSystolic !== null) {
    if (vitals.bloodPressureSystolic < settings.bpSystolicMinCritical) {
      await createAlert(patient, 'BLOOD_PRESSURE', 'CRITICAL',
        `Critical low systolic BP: ${vitals.bloodPressureSystolic} mmHg`,
        vitals.bloodPressureSystolic, settings.bpSystolicMinCritical)
    } else if (vitals.bloodPressureSystolic > settings.bpSystolicMaxCritical) {
      await createAlert(patient, 'BLOOD_PRESSURE', 'CRITICAL',
        `Critical high systolic BP: ${vitals.bloodPressureSystolic} mmHg`,
        vitals.bloodPressureSystolic, settings.bpSystolicMaxCritical)
    } else if (vitals.bloodPressureSystolic > settings.bpSystolicMaxLow) {
      await createAlert(patient, 'BLOOD_PRESSURE', 'HIGH',
        `High systolic BP: ${vitals.bloodPressureSystolic} mmHg`,
        vitals.bloodPressureSystolic, settings.bpSystolicMaxLow)
    }
  }
  
  // Blood Pressure Diastolic
  if (vitals.bloodPressureDiastolic !== null) {
    if (vitals.bloodPressureDiastolic < settings.bpDiastolicMinCritical) {
      await createAlert(patient, 'BLOOD_PRESSURE', 'CRITICAL',
        `Critical low diastolic BP: ${vitals.bloodPressureDiastolic} mmHg`,
        vitals.bloodPressureDiastolic, settings.bpDiastolicMinCritical)
    } else if (vitals.bloodPressureDiastolic > settings.bpDiastolicMaxCritical) {
      await createAlert(patient, 'BLOOD_PRESSURE', 'CRITICAL',
        `Critical high diastolic BP: ${vitals.bloodPressureDiastolic} mmHg`,
        vitals.bloodPressureDiastolic, settings.bpDiastolicMaxCritical)
    }
  }
  
  // Temperature
  if (vitals.temperature !== null) {
    if (vitals.temperature < settings.tempMinCritical) {
      await createAlert(patient, 'TEMPERATURE', 'CRITICAL',
        `Critical low temperature: ${vitals.temperature}°C`,
        vitals.temperature, settings.tempMinCritical)
    } else if (vitals.temperature > settings.tempMaxCritical) {
      await createAlert(patient, 'TEMPERATURE', 'CRITICAL',
        `Critical high temperature: ${vitals.temperature}°C`,
        vitals.temperature, settings.tempMaxCritical)
    } else if (vitals.temperature > settings.tempMaxLow) {
      await createAlert(patient, 'TEMPERATURE', 'HIGH',
        `High temperature: ${vitals.temperature}°C`,
        vitals.temperature, settings.tempMaxLow)
    }
  }
  
  // Oxygen Saturation
  if (vitals.oxygenSaturation !== null) {
    if (vitals.oxygenSaturation < settings.oxygenMinCritical) {
      await createAlert(patient, 'OXYGEN', 'CRITICAL',
        `Critical low SpO2: ${vitals.oxygenSaturation}%`,
        vitals.oxygenSaturation, settings.oxygenMinCritical)
    } else if (vitals.oxygenSaturation < settings.oxygenMinLow) {
      await createAlert(patient, 'OXYGEN', 'HIGH',
        `Low SpO2: ${vitals.oxygenSaturation}%`,
        vitals.oxygenSaturation, settings.oxygenMinLow)
    }
  }
  
  // Blood Glucose
  if (vitals.bloodGlucose !== null) {
    if (vitals.bloodGlucose < settings.glucoseMinCritical) {
      await createAlert(patient, 'GLUCOSE', 'CRITICAL',
        `Critical low blood glucose: ${vitals.bloodGlucose} mg/dL`,
        vitals.bloodGlucose, settings.glucoseMinCritical)
    } else if (vitals.bloodGlucose > settings.glucoseMaxCritical) {
      await createAlert(patient, 'GLUCOSE', 'CRITICAL',
        `Critical high blood glucose: ${vitals.bloodGlucose} mg/dL`,
        vitals.bloodGlucose, settings.glucoseMaxCritical)
    } else if (vitals.bloodGlucose > settings.glucoseMaxLow) {
      await createAlert(patient, 'GLUCOSE', 'HIGH',
        `High blood glucose: ${vitals.bloodGlucose} mg/dL`,
        vitals.bloodGlucose, settings.glucoseMaxLow)
    }
  }
  
  // Update patient risk score
  await updatePatientRiskScore(patient.id)
}

async function createAlert(
  patient: PatientData,
  type: string,
  severity: string,
  message: string,
  value: number,
  threshold: number
) {
  await db.alert.create({
    data: {
      patientId: patient.id,
      type,
      severity,
      message,
      value,
      threshold,
      status: 'ACTIVE'
    }
  })
}

// Calculate and update patient risk score
export async function updatePatientRiskScore(patientId: string): Promise<number> {
  // Get patient's recent vitals and alerts
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const alerts = await db.alert.findMany({
    where: {
      patientId,
      createdAt: { gte: thirtyDaysAgo }
    }
  })
  
  const vitals = await db.vitals.findMany({
    where: {
      patientId,
      recordedAt: { gte: thirtyDaysAgo }
    }
  })
  
  // Calculate risk score (0-100)
  let riskScore = 0
  
  // Alert-based scoring
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length
  const highAlerts = alerts.filter(a => a.severity === 'HIGH' && a.status === 'ACTIVE').length
  const mediumAlerts = alerts.filter(a => a.severity === 'MEDIUM' && a.status === 'ACTIVE').length
  
  riskScore += criticalAlerts * 25
  riskScore += highAlerts * 10
  riskScore += mediumAlerts * 5
  
  // Vitals frequency scoring (more readings = better monitoring)
  if (vitals.length >= 14) {
    riskScore -= 5 // Regular monitoring reduces risk
  }
  
  // Cap at 100
  riskScore = Math.min(100, Math.max(0, riskScore))
  
  // Determine risk level
  let riskLevel = 'LOW'
  if (riskScore >= 75) riskLevel = 'CRITICAL'
  else if (riskScore >= 50) riskLevel = 'HIGH'
  else if (riskScore >= 25) riskLevel = 'MEDIUM'
  
  // Update patient
  await db.patient.update({
    where: { id: patientId },
    data: { riskScore, riskLevel }
  })
  
  return riskScore
}

// Get risk level color
export function getRiskLevelColor(level: string): string {
  switch (level) {
    case 'CRITICAL': return 'text-red-600 bg-red-100'
    case 'HIGH': return 'text-orange-600 bg-orange-100'
    case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
    default: return 'text-green-600 bg-green-100'
  }
}

// Get severity color
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL': return 'destructive'
    case 'HIGH': return 'destructive'
    case 'MEDIUM': return 'secondary'
    default: return 'outline'
  }
}
