// Types for the Health Monitoring System

export interface User {
  id: string
  email: string
  name: string
  role: 'DOCTOR' | 'ADMIN'
}

export interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  phone?: string
  email?: string
  address?: string
  emergencyContact?: string
  medicalHistory?: string
  allergies?: string
  doctorId?: string
  doctor?: {
    id: string
    name: string
    email: string
  }
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  isActive: boolean
  createdAt: string
  updatedAt: string
  vitals?: Vitals[]
  alerts?: Alert[]
  _count?: {
    vitals: number
    alerts: number
  }
}

export interface Vitals {
  id: string
  patientId: string
  patient?: {
    id: string
    firstName: string
    lastName: string
  }
  heartRate?: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  temperature?: number
  oxygenSaturation?: number
  respiratoryRate?: number
  bloodGlucose?: number
  weight?: number
  height?: number
  notes?: string
  recordedAt: string
  createdAt: string
}

export interface Alert {
  id: string
  patientId: string
  patient?: {
    id: string
    firstName: string
    lastName: string
  }
  type: 'HEART_RATE' | 'BLOOD_PRESSURE' | 'TEMPERATURE' | 'OXYGEN' | 'GLUCOSE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  value: number
  threshold: number
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
  acknowledgedBy?: string
  acknowledgedAt?: string
  acknowledgedUser?: {
    id: string
    name: string
  }
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface SystemSettings {
  id: string
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
  updatedAt: string
}

export interface AnalyticsData {
  overview: {
    totalPatients: number
    activeAlerts: number
    totalVitals: number
    totalDoctors: number
  }
  patientsByRiskLevel: Array<{
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    _count: number
  }>
  alertsBySeverity: Array<{
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    _count: number
  }>
  alertsByType: Array<{
    type: 'HEART_RATE' | 'BLOOD_PRESSURE' | 'TEMPERATURE' | 'OXYGEN' | 'GLUCOSE'
    _count: number
  }>
  vitalsTrend: Array<{
    date: string
    count: number
    avgHeartRate: number | null
    avgSystolic: number | null
    avgTemp: number | null
    avgOxygen: number | null
    avgGlucose: number | null
  }>
  recentAlerts: Alert[]
}

export interface HealthReport {
  title: string
  generatedAt: string
  period: string
  patient: {
    name: string
    dateOfBirth: string
    gender: string
    phone?: string
    email?: string
    address?: string
    emergencyContact?: string
    medicalHistory: string[]
    allergies: string[]
    riskLevel: string
    riskScore: number
    doctor?: string
  }
  summary: {
    totalReadings: number
    avgHeartRate: number | null
    avgSystolic: number | null
    avgDiastolic: number | null
    avgTemperature: number | null
    avgOxygen: number | null
    avgGlucose: number | null
    totalAlerts: number
    criticalAlerts: number
    activeAlerts: number
  }
  vitals: Array<{
    date: string
    heartRate?: number
    bloodPressure?: string
    temperature?: number
    oxygenSaturation?: number
    bloodGlucose?: number
    weight?: number
  }>
  alerts: Array<{
    date: string
    type: string
    severity: string
    message: string
    status: string
  }>
}
