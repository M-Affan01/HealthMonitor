'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart, Legend
} from 'recharts'
import {
  Activity, AlertTriangle, Users, Heart, Thermometer, Droplets,
  LogOut, Settings, Plus, Search, FileText, Bell, TrendingUp,
  Calendar, Phone, Mail, MapPin, User, Clock, CheckCircle,
  AlertCircle, BarChart3, PieChartIcon, Download, RefreshCw,
  Database, ChevronRight, ChevronLeft, LayoutDashboard, Microscope, Target, HeartPulse, Zap, ShieldAlert
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/ThemeToggle'

import type { User as UserType, Patient, Vitals, Alert as AlertType, AnalyticsData, SystemSettings, HealthReport } from '@/lib/types'

type View = 'login' | 'dashboard' | 'patients' | 'patient-detail' | 'vitals' | 'alerts' | 'analytics' | 'settings'
type AuthView = 'login' | 'register'

const COLORS = ['#22c55e', '#eab308', '#f87171', '#ef4444']
const RISK_COLORS: Record<string, string> = {
  LOW: '#10b981',
  MEDIUM: '#fbbf24',
  HIGH: '#fb923c',
  CRITICAL: '#f87171'
}

export default function Home() {
  const [user, setUser] = useState<UserType | null>(null)
  const [view, setView] = useState<View>('login')
  const [authView, setAuthView] = useState<AuthView>('login')
  const [loading, setLoading] = useState(true)

  // Data states
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [vitals, setVitals] = useState<Vitals[]>([])
  const [alerts, setAlerts] = useState<AlertType[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [settings, setSettings] = useState<SystemSettings | null>(null)

  // Form states
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [showAddVitals, setShowAddVitals] = useState(false)
  const [showPatientDetail, setShowPatientDetail] = useState(false)

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch('/api/patients')
      if (res.ok) {
        const data = await res.json()
        setPatients(data.patients)
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    }
  }, [])

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts?status=ACTIVE')
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.alerts)
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    }
  }, [])

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics')
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }, [])

  const fetchPatientVitals = useCallback(async (patientId: string) => {
    try {
      const res = await fetch(`/api/vitals?patientId=${patientId}&days=7`)
      if (res.ok) {
        const data = await res.json()
        setVitals(data.vitals)
      }
    } catch (error) {
      console.error('Failed to fetch vitals:', error)
    }
  }, [])

  // Always show login page first — clear any existing session on mount
  useEffect(() => {
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => setLoading(false))
  }, [])

  // Fetch data when user logs in
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        await Promise.all([
          fetchPatients(),
          fetchAlerts(),
          fetchAnalytics()
        ])
      }
      loadData()
    }
  }, [user, fetchPatients, fetchAlerts, fetchAnalytics])


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password')
        })
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setView('dashboard')
        toast.success(`Welcome back, ${data.user.name}!`, { description: 'Neural link authorized successfully.' })
      } else {
        const error = await res.json()
        toast.error('Authorization failed', { description: error.error || 'Invalid credentials. Please try again.' })
      }
    } catch (error) {
      toast.error('Connection failed', { description: 'Could not reach the server. Check your network.' })
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          name: formData.get('name'),
          role: formData.get('role')
        })
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setView('dashboard')
        toast.success('Node initialized!', { description: `Welcome to the grid, ${data.user.name}.` })
      } else {
        const error = await res.json()
        toast.error('Registration failed', { description: error.error || 'Could not create account. Please try again.' })
      }
    } catch (error) {
      toast.error('Connection failed', { description: 'Could not reach the server.' })
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setView('login')
  }

  const handleSeedDatabase = async () => {
    const toastId = toast.loading('Seeding database...', { description: 'Populating sample patients, vitals, and alerts.' })
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      if (res.ok) {
        toast.success('Database seeded!', {
          id: toastId,
          description: 'Login: admin@healthmonitor.com / admin123 or dr.smith@healthmonitor.com / doctor123',
          duration: 8000
        })
        fetchPatients(); fetchAlerts(); fetchAnalytics()
      } else {
        toast.error('Seed failed', { id: toastId, description: 'Could not seed the database.' })
      }
    } catch (error) {
      toast.error('Seed failed', { id: toastId, description: 'Connection error.' })
    }
  }

  const handleAddPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          dateOfBirth: formData.get('dateOfBirth'),
          gender: formData.get('gender'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          address: formData.get('address'),
          emergencyContact: formData.get('emergencyContact'),
          medicalHistory: JSON.stringify((formData.get('medicalHistory') as string || '').split(',').map(s => s.trim()).filter(Boolean)),
          allergies: JSON.stringify((formData.get('allergies') as string || '').split(',').map(s => s.trim()).filter(Boolean))
        })
      })

      if (res.ok) {
        setShowAddPatient(false)
        fetchPatients()
        toast.success('Patient enrolled successfully', { description: 'New node is now active in the monitoring grid.' })
      } else {
        const error = await res.json()
        toast.error('Enrollment failed', { description: error.error || 'Could not add patient. Please try again.' })
      }
    } catch (error) {
      toast.error('Network error', { description: 'Failed to connect to server. Check your connection.' })
    }
  }

  const handleAddVitals = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPatient) return

    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          heartRate: formData.get('heartRate') || null,
          bloodPressureSystolic: formData.get('bloodPressureSystolic') || null,
          bloodPressureDiastolic: formData.get('bloodPressureDiastolic') || null,
          temperature: formData.get('temperature') || null,
          oxygenSaturation: formData.get('oxygenSaturation') || null,
          respiratoryRate: formData.get('respiratoryRate') || null,
          bloodGlucose: formData.get('bloodGlucose') || null,
          weight: formData.get('weight') || null,
          notes: formData.get('notes') || null
        })
      })

      if (res.ok) {
        setShowAddVitals(false)
        fetchPatientVitals(selectedPatient.id)
        fetchAlerts()
        fetchAnalytics()
        fetchPatients()
        toast.success('Biometrics logged', { description: 'Vitals saved and risk score recalculated.' })
      } else {
        const error = await res.json()
        toast.error('Log failed', { description: error.error || 'Could not save vitals. Please review your inputs.' })
      }
    } catch (error) {
      toast.error('Network error', { description: 'Failed to connect to server.' })
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACKNOWLEDGED' })
      })

      if (res.ok) {
        fetchAlerts()
        fetchAnalytics()
      }
    } catch (error) {
      alert('Failed to acknowledge alert')
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' })
      })

      if (res.ok) {
        fetchAlerts()
        fetchAnalytics()
      }
    } catch (error) {
      alert('Failed to resolve alert')
    }
  }

  const handleViewPatient = async (patient: Patient) => {
    setSelectedPatient(patient)
    await fetchPatientVitals(patient.id)
    setShowPatientDetail(true)
    setView('patient-detail')
  }

  const handleExportReport = async (patientId: string) => {
    const toastId = toast.loading('Generating report...', { description: 'Compiling biometric data and clinical history.' })
    try {
      const res = await fetch(`/api/reports?patientId=${patientId}&days=7`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `health-report-${patientId}-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Report downloaded', { id: toastId, description: 'PDF has been saved to your device.' })
      } else {
        const errJson = await res.json().catch(() => ({}))
        toast.error('Report generation failed', { id: toastId, description: errJson.error || 'Server could not generate the PDF. Please try again.' })
      }
    } catch (error) {
      console.error('Report generation error:', error)
      toast.error('Report generation failed', { id: toastId, description: 'An unexpected error occurred. Please try again.' })
    }
  }

  const handleExportGlobalTelemetry = () => {
    if (!analytics || !analytics.vitalsTrend || analytics.vitalsTrend.length === 0) {
      toast.error('No telemetry data available', { description: 'The clinical grid has no active trend signals to export.' })
      return
    }

    const toastId = toast.loading('Exporting telemetry stream...', { description: 'Generating synchronized CSV ledger.' })

    try {
      const headers = ['Date', 'Readings', 'Avg HR (bpm)', 'Avg Systolic (mmHg)', 'Avg Temp (°C)', 'Avg SpO2 (%)', 'Avg Glucose (mg/dL)']
      const rows = analytics.vitalsTrend.map(t => [
        format(new Date(t.date), 'yyyy-MM-dd HH:mm'),
        t.count.toString(),
        t.avgHeartRate?.toFixed(1) || 'N/A',
        t.avgSystolic?.toFixed(0) || 'N/A',
        t.avgTemp?.toFixed(1) || 'N/A',
        t.avgOxygen?.toFixed(1) || 'N/A',
        t.avgGlucose?.toFixed(1) || 'N/A'
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `medpulse-telemetry-grid-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Telemetry stream exported', { id: toastId, description: 'Clinical ledger saved successfully.' })
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export interrupted', { id: toastId, description: 'Signal failure during ledger generation.' })
    }
  }

  // Filter patients by search
  const filteredPatients = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Auth views
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden relative">
        {/* Deep Space Background with Floating Glows */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-float" />
          <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full animate-float" style={{ animationDelay: '-7s' }} />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-600/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-12s' }} />
        </div>

        {/* Theme Toggle - Fixed position on login page */}
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md z-10 p-4"
        >
          <div className="relative group">
            {/* Outer Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-[2rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />

            <Card className="border-border/50 bg-card backdrop-blur-3xl shadow-2xl overflow-hidden relative rounded-[2rem]">
              <CardHeader className="text-center pb-2 relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 3 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 150, delay: 0.3 }}
                  className="flex justify-center mb-8"
                >
                  <div className="relative">
                    <div className="relative p-5 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl shadow-2xl border-border/20">
                      <HeartPulse className="h-10 w-10 text-foreground" />
                    </div>
                  </div>
                </motion.div>

                <h1 className="text-4xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 mb-2">
                  MEDPULSE <span className="text-blue-500">AI</span>
                </h1>
                <p className="text-muted-foreground font-medium tracking-widest text-[10px] uppercase">
                  {authView === 'login' ? 'Neural Link Authorization' : 'Biometric Identity Creation'}
                </p>
              </CardHeader>

              <CardContent className="pt-8 px-8 pb-10">
                <Tabs value={authView} onValueChange={(v) => setAuthView(v as AuthView)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-10 bg-muted/50 border border-border/50 p-1.5 rounded-xl">
                    <TabsTrigger
                      value="login"
                      className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-foreground data-[state=active]:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300"
                    >
                      Login
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-foreground data-[state=active]:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300"
                    >
                      Register
                    </TabsTrigger>
                  </TabsList>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={authView}
                      initial={{ opacity: 0, x: 10, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, x: -10, filter: 'blur(10px)' }}
                      transition={{ duration: 0.4, ease: "circOut" }}
                    >
                      {authView === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                          <div className="space-y-3">
                            <Label className="text-muted-foreground text-xs font-bold uppercase tracking-widest ml-1">Terminal ID</Label>
                            <div className="relative group">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80 group-focus-within:text-blue-400 transition-colors" />
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@healthmonitor.com"
                                className="pl-10 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground/90 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 h-12 rounded-xl"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center ml-1">
                              <Label className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Encyption Key</Label>
                              <span className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer">Recover Key?</span>
                            </div>
                            <div className="relative group">
                              <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80 group-focus-within:text-blue-400 transition-colors" />
                              <Input
                                id="password"
                                name="password"
                                type="password"
                                className="pl-10 bg-muted/50 border-border/50 text-foreground focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 h-12 rounded-xl"
                                required
                              />
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-foreground shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all py-4 rounded-xl text-sm font-bold uppercase tracking-widest"
                          >
                            Authenticate Session
                          </motion.button>
                        </form>
                      ) : (
                        <form onSubmit={handleRegister} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-xs font-bold uppercase tracking-widest ml-1">Identity</Label>
                              <Input name="name" placeholder="Full Name" className="bg-muted/50 border-border/50 text-foreground rounded-xl" required />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-xs font-bold uppercase tracking-widest ml-1">Clinical Role</Label>
                              <Select name="role" defaultValue="DOCTOR">
                                <SelectTrigger className="bg-muted/50 border-border/50 text-foreground rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-border/20 text-foreground rounded-xl">
                                  <SelectItem value="DOCTOR">Doctor</SelectItem>
                                  <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs font-bold uppercase tracking-widest ml-1">Secure Email</Label>
                            <Input name="email" type="email" className="bg-muted/50 border-border/50 text-foreground rounded-xl" required />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs font-bold uppercase tracking-widest ml-1">Vault Key</Label>
                            <Input name="password" type="password" className="bg-muted/50 border-border/50 text-foreground rounded-xl" required />
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-foreground shadow-xl py-4 rounded-xl text-sm font-bold uppercase tracking-widest mt-4"
                          >
                            Create Identity
                          </motion.button>
                        </form>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Tabs>

                <div className="flex items-center my-10">
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                <Button
                  variant="ghost"
                  className="w-full group hover:bg-muted/50 text-muted-foreground/80 hover:text-blue-400 transition-all rounded-xl border border-border/50"
                  onClick={handleSeedDatabase}
                >
                  <Database className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                  Synchronize Sample Phantoms
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex justify-center gap-8 items-center">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-muted-foreground/90 font-bold uppercase tracking-widest">Mainframe Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span className="text-[10px] text-muted-foreground/90 font-bold uppercase tracking-widest">Encryption v8.4</span>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Main application
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 transition-colors duration-500">
      {/* Background Decor - Subtle for both themes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-60">
        <div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-primary/20 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[20%] right-[-5%] w-[25%] h-[25%] bg-blue-500/20 blur-[100px] rounded-full animate-float" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-3xl border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            className="flex items-center gap-3"
          >
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <HeartPulse className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-foreground">MEDPULSE <span className="text-blue-500">AI</span></h1>
              <p className="text-[9px] text-muted-foreground/80 font-bold uppercase tracking-[0.3em]">Clinical Intelligence Unit</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* Navigation */}
            <nav className="hidden md:flex items-center bg-muted/50 border border-border/50 p-1 rounded-2xl">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'patients', label: 'Patients', icon: Users },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'alerts', label: 'Alerts', icon: Bell },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${view === item.id
                    ? 'bg-blue-600 text-foreground shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 pr-6 border-r border-border/50"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-foreground">{user?.name}</p>
                <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-blue-500/30 text-blue-400 bg-blue-500/5 font-bold uppercase tracking-widest">
                  {user?.role}
                </Badge>
              </div>
              <Avatar className="h-10 w-10 border-2 border-border/50 shadow-xl ring-2 ring-blue-500/20">
                <AvatarFallback className="bg-blue-600 text-foreground font-bold text-sm">
                  {user?.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('settings')}
                className={`hover:bg-muted/50 hover:text-blue-400 rounded-xl transition-colors ${view === 'settings' ? 'text-blue-400 bg-muted/50' : 'text-muted-foreground/80'}`}
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-red-500/10 hover:text-red-500 rounded-xl text-muted-foreground/80 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 relative">
        <AnimatePresence mode="wait">
          {/* Dashboard View */}
          {view === 'dashboard' && analytics && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl font-black tracking-tighter text-foreground"
                  >
                    Clinical Overview
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground/80 font-medium tracking-wide"
                  >
                    Monitoring real-time telemetry from {patients.length} active nodes.
                  </motion.p>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="bg-muted/50 border border-border/50 p-3 rounded-2xl flex items-center gap-3"
                >
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-xs">
                    <p className="text-muted-foreground/80 font-bold uppercase tracking-widest text-[8px]">System Timestamp</p>
                    <p className="text-foreground font-mono font-bold tracking-tight">{format(new Date(), 'MMM dd, yyyy · HH:mm:ss')}</p>
                  </div>
                </motion.div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Total Patients', value: analytics.overview.totalPatients, icon: Users, color: 'text-blue-400', trend: '+12%', bg: 'bg-blue-500/10', glow: 'cyan-glow-hover' },
                  { title: 'Active Alerts', value: analytics.overview.activeAlerts, icon: Bell, color: 'text-red-400', trend: 'Critical', bg: 'bg-red-500/10', glow: 'red-glow-hover' },
                  { title: 'System Stability', value: '98.4%', icon: Activity, color: 'text-emerald-400', trend: 'Nominal', bg: 'bg-emerald-500/10', glow: 'emerald-glow-hover' },
                  {
                    title: 'Lead Risk Index',
                    value: (() => {
                      const count = (analytics.patientsByRiskLevel?.find(r => r.riskLevel === 'HIGH')?._count || 0) +
                        (analytics.patientsByRiskLevel?.find(r => r.riskLevel === 'CRITICAL')?._count || 0);
                      return `${count} ${count === 1 ? 'Node' : 'Nodes'}`;
                    })(),
                    icon: Zap, color: 'text-yellow-400', trend: 'Active', bg: 'bg-yellow-500/10', glow: 'emerald-glow-hover'
                  }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.3, type: 'spring' }}
                  >
                    <Card className={`bg-card backdrop-blur-3xl border-border/50 relative overflow-hidden group shining-hover transition-colors shadow-2xl scanline`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className={`p-4 rounded-2xl ${stat.bg} border border-border/50`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                          </div>
                          <Badge variant="outline" className={`${stat.color === 'text-red-400' ? 'border-red-500/30 text-red-500' : 'border-border/50 text-muted-foreground/80'} font-black text-[9px] uppercase tracking-widest px-3 h-5`}>
                            {stat.trend}
                          </Badge>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-1">{stat.title}</p>
                        <h3 className="text-3xl font-black text-foreground tracking-tighter">{stat.value}</h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Risk Level Distribution */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <div className="rounded-[2rem]">
                    <Card className="bg-card backdrop-blur-3xl border-border/50 rounded-[2rem] overflow-hidden relative z-10 shining-hover">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
                        <div>
                          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Risk Assessment</CardTitle>
                          <CardDescription className="text-foreground font-bold">Population Health Distribution</CardDescription>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <PieChartIcon className="h-4 w-4 text-blue-400" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="h-64 relative">
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-3xl font-black text-foreground">{analytics.overview.totalPatients}</p>
                            <p className="text-[9px] text-muted-foreground/80 font-bold uppercase tracking-widest">Active nodes</p>
                          </div>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analytics.patientsByRiskLevel.map(r => ({
                                  name: r.riskLevel,
                                  value: r._count
                                }))}
                                cx="50%"
                                cy="50%"
                                innerRadius={75}
                                outerRadius={95}
                                paddingAngle={10}
                                dataKey="value"
                                stroke="none"
                              >
                                {analytics.patientsByRiskLevel.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.riskLevel] || COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--popover) / 0.8)', backdropFilter: 'blur(12px)', border: '1px solid hsl(var(--border) / 0.1)', borderRadius: '16px', color: 'hsl(var(--foreground))' }}
                                itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '11px', fontWeight: 'bold' }}
                              />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(v) => <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-2">{v}</span>}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>

                {/* Alerts by Type */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <div className="rounded-[2rem]">
                    <Card className="bg-card backdrop-blur-3xl border-border/50 rounded-[2rem] overflow-hidden relative z-10 shining-hover">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
                        <div>
                          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Anomaly Analysis</CardTitle>
                          <CardDescription className="text-foreground font-bold">System Alerts Breakdown</CardDescription>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-emerald-400" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.alertsByType.map(a => ({
                              type: a.type.replace('_', ' '),
                              count: a._count
                            }))}>
                              <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.4} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                              <XAxis
                                dataKey="type"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 'bold', fill: 'hsl(var(--muted-foreground))' }}
                              />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                              <Tooltip
                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                contentStyle={{ backgroundColor: 'hsl(var(--popover) / 0.8)', backdropFilter: 'blur(12px)', border: '1px solid hsl(var(--border) / 0.1)', borderRadius: '16px' }}
                              />
                              <Bar dataKey="count" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={35} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </div>

              {/* Vitals Trend */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <div className="rounded-[3rem]">
                  <Card className="bg-card backdrop-blur-3xl border-border/50 rounded-[3rem] overflow-hidden relative z-10 shining-hover">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
                      <div>
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Clinical Trends</CardTitle>
                        <CardDescription className="text-foreground font-bold">Biometric Telemetry Stream (Last 7 Days)</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="h-9 bg-muted/50 border-border/50 hover:bg-white/10 text-muted-foreground hover:text-foreground rounded-xl" onClick={handleExportGlobalTelemetry}>
                        <Download className="h-3.5 w-3.5 mr-2" />Export Telemetry
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-10">
                      <div className="h-80 w-full relative">
                        {/* Grid Glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_70%)] pointer-events-none" />

                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analytics.vitalsTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorO2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                              dataKey="date"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10, fontWeight: 'bold', fill: 'hsl(var(--muted-foreground))' }}
                              tickFormatter={(v) => format(new Date(v), 'MMM dd')}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                              itemStyle={{ fontSize: '12px', fontWeight: 'black', color: 'hsl(var(--foreground))' }}
                            />
                            <Legend
                              verticalAlign="top"
                              align="right"
                              iconType="circle"
                              formatter={(v) => <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">{v}</span>}
                            />
                            <Area type="monotone" dataKey="avgHeartRate" name="Heart Rate" stroke="#f87171" fillOpacity={1} fill="url(#colorHr)" strokeWidth={4} />
                            <Area type="monotone" dataKey="avgOxygen" name="Oxygen Sat" stroke="#34d399" fillOpacity={1} fill="url(#colorO2)" strokeWidth={4} />
                            <Area type="monotone" dataKey="avgBloodPressure" name="Systolic BP" stroke="#60a5fa" fillOpacity={1} fill="url(#colorBp)" strokeWidth={4} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Patients View */}
        <AnimatePresence mode="wait">
          {view === 'patients' && (
            <motion.div
              key="patients"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10"
            >
              <div className="rounded-[2.5rem]">
                <div className="flex flex-col sm:flex-row gap-6 justify-between items-center bg-card backdrop-blur-3xl p-8 rounded-[2.5rem] border border-border/50 relative z-10 shadow-2xl">
                  <div className="relative flex-1 max-w-lg w-full group">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/80 transition-colors group-focus-within:text-blue-400" />
                    <Input
                      placeholder="Search node signal by name or ID..."
                      className="pl-14 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground/90 focus-visible:ring-blue-500/50 h-14 rounded-2xl text-base"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
                  <DialogTrigger asChild>
                    <Button className="h-14 bg-blue-600 hover:bg-blue-500 text-foreground shadow-[0_0_20px_rgba(37,99,235,0.3)] px-10 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all">
                      <Plus className="h-5 w-5 mr-3" />Initialize Node
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl bg-background/95 backdrop-blur-2xl border-border/50 text-foreground rounded-[2.5rem] shadow-2xl">
                    <DialogHeader className="pb-6 border-b border-border/50">
                      <DialogTitle className="text-4xl font-black tracking-tighter">Clinical Intake</DialogTitle>
                      <DialogDescription className="text-muted-foreground text-base font-medium">Initialize a new biometric monitoring node within the surveillance grid.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddPatient} className="space-y-8 pt-8">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">First Name</Label>
                          <Input name="firstName" placeholder="Aris" className="bg-muted/50 border-border/50 text-foreground rounded-xl h-12 focus:ring-blue-500/50" required />
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Last Name</Label>
                          <Input name="lastName" placeholder="Vandermeer" className="bg-muted/50 border-border/50 text-foreground rounded-xl h-12 focus:ring-blue-500/50" required />
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Birth Timeline</Label>
                          <Input name="dateOfBirth" type="date" className="bg-muted/50 border-border/50 text-foreground rounded-xl h-12 [color-scheme:dark]" required />
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Biological Identity</Label>
                          <select name="gender" className="w-full bg-muted/50 border-border/50 text-foreground rounded-xl h-12 px-4 text-sm focus:ring-blue-500/50 outline-none appearance-none" required>
                            <option value="MALE" className="bg-slate-900">MALE</option>
                            <option value="FEMALE" className="bg-slate-900">FEMALE</option>
                            <option value="OTHER" className="bg-slate-900">OTHER</option>
                          </select>
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Comm Channel (Email)</Label>
                          <Input name="email" type="email" placeholder="aris.v@grid.node" className="bg-muted/50 border-border/50 text-foreground rounded-xl h-12" required />
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Signal Link (Phone)</Label>
                          <Input name="phone" placeholder="+1 (555) 000-0000" className="bg-muted/50 border-border/50 text-foreground rounded-xl h-12" required />
                        </div>
                      </div>
                      <DialogFooter className="pt-4">
                        <Button type="submit" className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-foreground font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.2)] transition-all active:scale-95 text-sm">Verify & Activate Node</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Patients Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPatients.map((patient, idx) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, type: 'spring', damping: 20 }}
                  >
                    <Card
                      className="cursor-pointer bg-card backdrop-blur-3xl border-border/50 hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden rounded-[2.5rem] shadow-2xl shining-hover"
                      onClick={() => handleViewPatient(patient)}
                    >
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <CardContent className="p-8">
                        <div className="flex items-start justify-between mb-8">
                          <div className="flex items-center gap-5">
                            <div className="relative">
                              <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                              <Avatar className="h-16 w-16 border-2 border-border/50 shadow-2xl ring-4 ring-blue-500/5 group-hover:ring-blue-500/20 transition-all">
                                <AvatarFallback className={`bg-gradient-to-tr ${patient.gender === 'MALE' ? 'from-blue-600 to-cyan-500' : 'from-pink-600 to-rose-500'} text-foreground text-xl font-black`}>
                                  {patient.firstName[0]}{patient.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-[#05070a] ${patient.isActive !== false ? 'bg-emerald-500' : 'bg-slate-700'} shadow-[0_0_10px_rgba(16,185,129,0.3)]`} />
                            </div>
                            <div>
                              <h3 className="font-black text-xl text-foreground group-hover:text-blue-400 transition-colors tracking-tight">
                                {patient.firstName} {patient.lastName}
                              </h3>
                              <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                                <Target className="h-3 w-3" /> {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}Y · {patient.gender.charAt(0)}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${patient.riskLevel === 'HIGH' ? 'bg-red-500' : patient.riskLevel === 'MEDIUM' ? 'bg-orange-500' : 'bg-emerald-500'} text-foreground border-none font-black text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-full`}>
                            {patient.riskLevel} Case
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="bg-muted/50 p-4 rounded-2xl border border-border/50 group-hover:border-border/50 transition-colors">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/80 font-black mb-1.5">Risk Score</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-foreground">{Math.round(patient.riskScore)}</span>
                              <span className="text-[10px] font-bold text-muted-foreground/90">%</span>
                            </div>
                            <Progress value={patient.riskScore} className="h-1 mt-3 bg-muted/50" indicatorClassName={patient.riskScore > 70 ? "bg-red-500" : "bg-blue-600"} />
                          </div>
                          <div className="bg-muted/50 p-4 rounded-2xl border border-border/50 group-hover:border-border/50 transition-colors">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/80 font-black mb-1.5">Event Log</p>
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${patient._count?.alerts && patient._count.alerts > 0 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-muted/50 text-slate-700'}`}>
                                <Bell className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-black text-foreground">{patient._count?.alerts || 0} Events</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-border/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 text-[10px] font-black text-muted-foreground/80 hover:text-blue-400 uppercase tracking-widest p-0 group"
                            onClick={(e) => { e.stopPropagation(); handleExportReport(patient.id); }}
                          >
                            <Download className="h-3.5 w-3.5 mr-2 group-hover:animate-bounce" /> Report
                          </Button>
                          <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-blue-500 transition-all pointer-events-none" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {filteredPatients.length === 0 && (
                <div className="text-center py-24 flex flex-col items-center">
                  <div className="p-6 bg-background/50 rounded-full mb-6 border border-border/50">
                    <Users className="h-12 w-12 text-muted-foreground/90" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground tracking-tight">Node Registry Empty</h3>
                  <p className="text-base text-muted-foreground/80 max-w-sm mx-auto mt-2 italic">No active signals match the current search criteria.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Patient Detail View */}
        <AnimatePresence mode="wait">
          {view === 'patient-detail' && selectedPatient && (
            <motion.div
              key="patient-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setView('patients')} className="hover:bg-blue-500/10 text-blue-400 font-black text-xs uppercase tracking-widest rounded-xl transition-all h-10 px-6 border border-border/50">
                  <ChevronLeft className="h-4 w-4 mr-2" /> Return to Registry
                </Button>
              </div>

              {/* Patient Info Card */}
              <Card className="bg-card backdrop-blur-3xl border-border/50 rounded-[3rem] overflow-hidden relative shadow-2xl shining-hover">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-[100px]" />
                <CardContent className="p-10 relative">
                  <div className="flex flex-col md:flex-row gap-12 items-start">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-3xl opacity-50 animate-pulse" />
                      <Avatar className="h-40 w-40 border-4 border-border/50 shadow-2xl ring-8 ring-emerald-500/5">
                        <AvatarFallback className={`text-5xl font-black ${selectedPatient.gender === 'MALE' ? 'from-blue-600 to-cyan-500' : 'from-pink-600 to-rose-500'} bg-gradient-to-tr text-foreground`}>
                          {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 p-3.5 bg-slate-950 rounded-2xl shadow-2xl border border-border/50">
                        <Activity className="h-6 w-6 text-emerald-400 animate-pulse" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-8">
                      <div className="flex flex-wrap items-center gap-6">
                        <h2 className="text-5xl font-black tracking-tighter text-foreground">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                        <Badge className={`${selectedPatient.riskLevel === 'HIGH' ? 'bg-red-500' : selectedPatient.riskLevel === 'MEDIUM' ? 'bg-orange-500' : 'bg-emerald-500'} border-none font-black text-xs px-6 py-2 rounded-full text-foreground uppercase tracking-widest shadow-xl`}>
                          {selectedPatient.riskLevel} Case
                        </Badge>
                        <Badge variant="outline" className="border-border/50 text-muted-foreground/80 font-black uppercase tracking-[0.2em] text-[10px] px-4 h-6">
                          Signal ID: {selectedPatient.id.slice(-8).toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                        {[
                          { icon: Calendar, label: 'Bio Timeline', value: `${new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()}Y (${format(new Date(selectedPatient.dateOfBirth), 'MMM dd, yyyy')})` },
                          { icon: Phone, label: 'Direct Comm', value: selectedPatient.phone || 'N/A' },
                          { icon: Mail, label: 'Digital Node', value: selectedPatient.email || 'N/A' },
                          { icon: Microscope, label: 'Lead Strategist', value: selectedPatient.doctor?.name || 'Unassigned' }
                        ].map((item, i) => (
                          <div key={i} className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/90 flex items-center gap-2">
                              <item.icon className="h-3.5 w-3.5 text-blue-500" /> {item.label}
                            </p>
                            <p className="text-sm font-black text-foreground/90 truncate tracking-tight">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-8 border-t border-border/50 flex items-center gap-12">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/90">Stability Matrix</p>
                            <span className={`${selectedPatient.riskScore > 70 ? 'text-red-400' : 'text-emerald-400'} text-sm font-black font-mono`}>{Math.round(selectedPatient.riskScore)}%</span>
                          </div>
                          <Progress value={selectedPatient.riskScore} className="h-1.5 bg-muted/50" indicatorClassName={selectedPatient.riskScore > 70 ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"} />
                        </div>
                        <div className="relative w-28 h-28 shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { value: selectedPatient.riskScore },
                                  { value: 100 - selectedPatient.riskScore }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={48}
                                startAngle={225}
                                endAngle={-45}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                              >
                                <Cell fill={selectedPatient.riskScore > 70 ? '#ef4444' : selectedPatient.riskScore > 40 ? '#f97316' : '#10b981'} />
                                <Cell fill="rgba(255,255,255,0.05)" />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-[9px] font-black text-muted-foreground/90 uppercase tracking-tighter">Impact</p>
                            <p className={`text-lg font-black ${selectedPatient.riskScore > 70 ? 'text-red-400' : 'text-foreground/90'}`}>{Math.round(selectedPatient.riskScore)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-5 w-full md:w-auto">
                      <Dialog open={showAddVitals} onOpenChange={setShowAddVitals}>
                        <DialogTrigger asChild>
                          <Button className="h-16 bg-blue-600 hover:bg-blue-500 text-foreground shadow-[0_0_30px_rgba(37,99,235,0.2)] active:scale-95 transition-all w-full md:w-64 rounded-2xl font-black uppercase tracking-widest text-xs">
                            <Plus className="h-6 w-6 mr-3" />Log Biometrics
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-3xl border-border/50 text-foreground rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                          <DialogHeader className="pb-6 border-b border-border/50">
                            <DialogTitle className="text-4xl font-black tracking-tighter text-foreground">Clinical Telemetry</DialogTitle>
                            <DialogDescription className="text-muted-foreground text-base font-medium">Stream new biometric data to the centralized risk engine.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddVitals} className="space-y-10 pt-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                              {[
                                { id: 'heartRate', label: 'Heart Rate', unit: 'BPM' },
                                { id: 'bloodPressureSystolic', label: 'Systolic', unit: 'mmHg' },
                                { id: 'bloodPressureDiastolic', label: 'Diastolic', unit: 'mmHg' },
                                { id: 'temperature', label: 'Core Temp', unit: '°C', step: '0.1' },
                                { id: 'oxygenSaturation', label: 'SpO2 Sat', unit: '%' },
                                { id: 'bloodGlucose', label: 'Glucose', unit: 'mg/dL' },
                                { id: 'respiratoryRate', label: 'Resp Rate', unit: '/min' },
                                { id: 'weight', label: 'Body Mass', unit: 'kg', step: '0.1' }
                              ].map(field => (
                                <div key={field.id} className="space-y-2.5">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 block ml-1">{field.label} ({field.unit})</Label>
                                  <Input id={field.id} name={field.id} type="number" step={field.step} className="bg-muted/50 border-border/50 text-foreground rounded-xl h-12 focus:ring-blue-500/50" />
                                </div>
                              ))}
                            </div>
                            <div className="space-y-2.5">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 block ml-1">Clinical Observations</Label>
                              <Textarea id="notes" name="notes" placeholder="Detailed analysis of node signal anomalies..." className="bg-muted/50 border-border/50 text-foreground rounded-2xl min-h-[120px] focus:ring-blue-500/50 text-sm" />
                            </div>
                            <DialogFooter>
                              <Button type="submit" className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-foreground font-black uppercase tracking-widest rounded-2xl shadow-2xl transition-all active:scale-95 text-base">Commit Telemetry Sync</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" className="h-16 border-border/50 bg-muted/50 text-muted-foreground hover:bg-white/10 hover:text-foreground w-full rounded-2xl font-black uppercase tracking-widest text-xs transition-all" onClick={() => handleExportReport(selectedPatient.id)}>
                        <FileText className="h-6 w-6 mr-4 text-red-500 opacity-80" />Export Analysis
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vitals Charts & Trends */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Heart Rate & BP Card */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <div className="rounded-[2.5rem]">
                    <Card className="bg-card backdrop-blur-3xl border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 shining-hover">
                      <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
                        <div>
                          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Cardiovascular Stream</CardTitle>
                          <CardDescription className="text-foreground font-bold text-base">BPM & Arterial Pressure Analysis</CardDescription>
                        </div>
                        <div className="p-3 bg-red-500/10 rounded-2xl">
                          <HeartPulse className="h-5 w-5 text-red-400" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-10">
                        <div className="h-80 relative">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.02),transparent_70%)] pointer-events-none" />
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={vitals.slice(0, 10).reverse().map(v => ({
                              date: format(new Date(v.recordedAt), 'MMM dd HH:mm'),
                              heartRate: v.heartRate,
                              systolic: v.bloodPressureSystolic,
                              diastolic: v.bloodPressureDiastolic
                            }))}>
                              <defs>
                                <linearGradient id="colorHrDetail" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.25} />
                                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="date" hide />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }} />
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px' }} />
                              <Area type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#f87171" fill="url(#colorHrDetail)" strokeWidth={5} />
                              <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#3b82f6" strokeWidth={5} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }} />
                              <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#8b5cf6" strokeWidth={5} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 3, stroke: '#fff' }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>

                {/* SpO2 & Temp Card */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="rounded-[2.5rem]">
                    <Card className="bg-card backdrop-blur-3xl border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 shining-hover">
                      <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
                        <div>
                          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Biosphere Metrics</CardTitle>
                          <CardDescription className="text-foreground font-bold text-base">Oxygen Saturation & Thermal Node</CardDescription>
                        </div>
                        <div className="p-3 bg-orange-500/10 rounded-2xl">
                          <Thermometer className="h-5 w-5 text-orange-400" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-10">
                        <div className="h-80 relative">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.02),transparent_70%)] pointer-events-none" />
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={vitals.slice(0, 10).reverse().map(v => ({
                              date: format(new Date(v.recordedAt), 'MMM dd HH:mm'),
                              temperature: v.temperature,
                              oxygen: v.oxygenSaturation
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="date" hide />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }} />
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px' }} />
                              <Line type="stepAfter" dataKey="temperature" name="Temp (°C)" stroke="#fb923c" strokeWidth={5} dot={{ r: 7, fill: '#fb923c', strokeWidth: 3, stroke: '#fff' }} />
                              <Line type="monotone" dataKey="oxygen" name="SpO2 (%)" stroke="#34d399" strokeWidth={5} dot={{ r: 7, fill: '#34d399', strokeWidth: 3, stroke: '#fff' }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </div>

              {/* Historical Log */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-card backdrop-blur-3xl border-border/50 rounded-[3rem] overflow-hidden shadow-2xl">
                  <CardHeader className="py-8 border-b border-border/50">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Centralized Biometric Repository</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow className="border-border/50 h-14">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-10">Timestamp</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">HR</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">BP</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Temp</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">SpO2</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pr-10 text-right">Clinician Analysis</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vitals.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-32 text-muted-foreground/90 font-bold uppercase tracking-widest italic text-sm">Node signal history empty.</TableCell>
                            </TableRow>
                          ) : (
                            vitals.map((v, i) => (
                              <TableRow key={v.id} className="border-border/50 hover:bg-muted/50 transition-all group h-16">
                                <TableCell className="text-xs font-mono font-black text-muted-foreground/80 whitespace-nowrap pl-10 group-hover:text-blue-400 transition-colors">
                                  {format(new Date(v.recordedAt), 'MM.dd HH:mm:ss')}
                                </TableCell>
                                <TableCell className="font-black text-foreground text-base">{v.heartRate || '-'}</TableCell>
                                <TableCell className="text-sm font-bold text-muted-foreground">
                                  {v.bloodPressureSystolic}/{v.bloodPressureDiastolic}
                                </TableCell>
                                <TableCell className="text-sm font-bold text-muted-foreground">{v.temperature ? `${v.temperature}°C` : '-'}</TableCell>
                                <TableCell>
                                  <Badge className={`${(v.oxygenSaturation ?? 0) > 94 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'} border font-black text-[10px] px-3 h-5`}>
                                    {v.oxygenSaturation ?? '-'}%
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground/80 pr-10 text-right max-w-sm truncate italic group-hover:text-foreground/90 transition-colors">
                                  {v.notes || 'Signal nominal'}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alerts View */}
        <AnimatePresence mode="wait">
          {view === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10"
            >
              <div className="rounded-[3rem]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-8 bg-card backdrop-blur-3xl p-10 rounded-[3rem] border border-border/50 relative z-10 shadow-2xl">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground">Central Surveillance</h2>
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80 mt-2">Active medical anomaly grid monitor.</p>
                  </div>
                  <Button variant="outline" onClick={() => { fetchAlerts(); fetchAnalytics(); }} className="h-14 bg-muted/50 border-border/50 text-muted-foreground hover:text-foreground rounded-2xl active:scale-95 transition-all px-10 font-black uppercase tracking-widest text-xs">
                    <RefreshCw className="h-5 w-5 mr-3" /> Re-sync Grid
                  </Button>
                </div>
              </div>

              <div className="grid gap-10">
                {alerts.length === 0 ? (
                  <Card className="bg-card backdrop-blur-3xl border-border/50 rounded-[3rem] shadow-2xl">
                    <CardContent className="py-32 text-center flex flex-col items-center">
                      <div className="p-8 bg-emerald-500/10 rounded-full mb-8">
                        <CheckCircle className="h-16 w-16 text-emerald-500/30" />
                      </div>
                      <h3 className="text-3xl font-black text-foreground tracking-tight">Patient Safety Confirmed</h3>
                      <p className="text-base text-muted-foreground/80 max-w-sm mx-auto mt-3 italic leading-relaxed">No pending critical anomalies or system alerts detected across the registry telemetry stream.</p>
                    </CardContent>
                  </Card>
                ) : (
                  alerts.map((alert, idx) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, type: 'spring' }}
                    >
                      <Card className={`
                        bg-card backdrop-blur-3xl border-border/50 hover:border-border/50 transition-all duration-500 relative overflow-hidden group rounded-[3.5rem] shadow-2xl shining-hover scanline
                        before:absolute before:left-0 before:top-0 before:bottom-0 before:w-3
                        ${alert.severity === 'CRITICAL' ? 'before:bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.15)]' : ''}
                        ${alert.severity === 'HIGH' ? 'before:bg-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.15)]' : ''}
                        ${alert.severity === 'MEDIUM' ? 'before:bg-yellow-500' : ''}
                        ${alert.severity === 'LOW' ? 'before:bg-emerald-500' : ''}
                      `}>
                        <CardContent className="p-10">
                          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
                            <div className="flex items-start gap-8">
                              <div className={`
                                p-5 rounded-2xl border-2
                                ${alert.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20 text-red-500' : alert.severity === 'HIGH' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}
                              `}>
                                <AlertTriangle className={`h-8 w-8 ${alert.severity === 'CRITICAL' ? 'animate-pulse' : ''}`} />
                              </div>
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-4">
                                  <h3 className="font-black text-2xl text-foreground tracking-tight group-hover:text-blue-400 transition-colors uppercase">{alert.patient?.firstName} {alert.patient?.lastName}</h3>
                                  <Badge className={`${alert.severity === 'CRITICAL' ? 'bg-red-500 text-foreground' : 'bg-muted/50 text-muted-foreground/80 border-border/50'} border-none font-black text-[10px] uppercase tracking-widest px-4 h-6 rounded-lg shadow-lg`}>
                                    {alert.severity}
                                  </Badge>
                                  <Badge variant="outline" className="border-border/50 text-[10px] font-black uppercase tracking-widest bg-muted/50 text-muted-foreground/80 h-6 px-4 rounded-lg">
                                    {alert.type.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-base font-black text-foreground/80 italic tracking-tight">"{alert.message}"</p>
                                <div className="flex flex-wrap items-center gap-8 text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/90 pt-2">
                                  <span className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    {format(new Date(alert.createdAt), 'MM.dd · HH:mm:ss')}
                                  </span>
                                  <span className="flex items-center gap-3">
                                    <Target className="h-4 w-4 text-emerald-500" />
                                    Threshold Delta: <span className="text-foreground/80 font-mono">{alert.threshold}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-5 w-full lg:w-auto">
                              {alert.status === 'ACTIVE' && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => handleAcknowledgeAlert(alert.id)} className="flex-1 lg:flex-none h-12 border-border/50 bg-muted/50 text-muted-foreground font-black hover:bg-white/10 hover:text-foreground uppercase tracking-widest text-[10px] px-8 rounded-xl transition-all active:scale-95">
                                    Acknowledge
                                  </Button>
                                  <Button size="sm" onClick={() => handleResolveAlert(alert.id)} className="flex-1 lg:flex-none h-12 bg-blue-600 hover:bg-blue-500 text-foreground font-black uppercase tracking-widest text-[10px] px-8 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95">
                                    Resolve Case
                                  </Button>
                                </>
                              )}
                              {alert.status === 'ACKNOWLEDGED' && (
                                <Button size="sm" onClick={() => handleResolveAlert(alert.id)} className="w-full lg:w-auto h-12 bg-emerald-600 hover:bg-emerald-500 text-foreground font-black uppercase tracking-widest text-[10px] px-10 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95">
                                  Complete Resolution
                                </Button>
                              )}
                              {alert.status === 'RESOLVED' && (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2">
                                  Anomaly Resolved
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analytics View */}
        <AnimatePresence mode="wait">
          {view === 'analytics' && analytics && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-10"
            >
              <div>
                <h2 className="text-4xl font-black tracking-tighter text-foreground">Data Intelligence</h2>
                <p className="text-muted-foreground/80 font-medium tracking-wide">Population health analytics and biometric insights grid.</p>
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Nodes', value: analytics.overview.totalPatients, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', hover: 'cyan-glow-hover' },
                  { label: 'Active Alerts', value: analytics.overview.activeAlerts, icon: Bell, color: 'text-red-400', bg: 'bg-red-500/10', hover: 'red-glow-hover' },
                  { label: 'Vitals Logged', value: analytics.overview.totalVitals, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', hover: 'emerald-glow-hover' },
                  { label: 'Physicians', value: analytics.overview.totalDoctors, icon: User, color: 'text-cyan-400', bg: 'bg-cyan-500/10', hover: 'cyan-glow-hover' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className={`bg-card backdrop-blur-3xl border-border/50 transition-all group relative overflow-hidden rounded-[2rem] shining-hover ${stat.hover}`}>
                      <CardContent className="p-7">
                        <div className={`p-4 ${stat.bg} border border-border/50 rounded-2xl w-fit mb-5`}>
                          <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-black tracking-tighter text-foreground">{stat.value}</h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <div className="rounded-[2.5rem]">
                    <Card className="bg-card backdrop-blur-3xl border-border/50 rounded-[2.5rem] overflow-hidden relative z-10 shining-hover">
                      <CardHeader className="pb-4 border-b border-border/50">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Risk Stratification</CardTitle>
                        <CardDescription className="text-foreground font-bold opacity-90">Population Distribution Profile</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-8">
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analytics.patientsByRiskLevel.map(r => ({ name: r.riskLevel, value: r._count }))}
                                cx="50%" cy="50%"
                                innerRadius={65} outerRadius={95}
                                paddingAngle={8} dataKey="value" stroke="none"
                              >
                                {analytics.patientsByRiskLevel.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.riskLevel] || COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', color: 'hsl(var(--foreground))' }} />
                              <Legend iconType="circle" formatter={(v) => <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest ml-2">{v}</span>} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <div className="rounded-[2.5rem]">
                    <Card className="bg-card backdrop-blur-3xl border-border/50 rounded-[2.5rem] overflow-hidden relative z-10 shining-hover">
                      <CardHeader className="pb-4 border-b border-border/50">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Anomaly Breakdown</CardTitle>
                        <CardDescription className="text-foreground font-bold opacity-90">Alerts by Severity Classification</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-8">
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.alertsBySeverity.map(a => ({ severity: a.severity, count: a._count }))}>
                              <defs>
                                <linearGradient id="aBarGradDetail" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="severity" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'black', fill: 'hsl(var(--muted-foreground))' }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                              <Bar dataKey="count" fill="url(#aBarGradDetail)" radius={[12, 12, 0, 0]} barSize={40} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div className="rounded-[3.5rem]">
                  <Card className="bg-card backdrop-blur-3xl border-border/50 rounded-[3.5rem] overflow-hidden relative z-10 shining-hover">
                    <CardHeader className="pb-6 border-b border-border/50">
                      <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Global Biometric Telemetry</CardTitle>
                      <CardDescription className="text-foreground font-bold opacity-90 text-base">7-Day Population Rolling Average</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-10">
                      <div className="h-96 relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(37,99,235,0.05),transparent_70%)] pointer-events-none" />
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analytics.vitalsTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="aHrGlobal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f87171" stopOpacity={0.25} /><stop offset="95%" stopColor="#f87171" stopOpacity={0} /></linearGradient>
                              <linearGradient id="aO2Global" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.25} /><stop offset="95%" stopColor="#34d399" stopOpacity={0} /></linearGradient>
                              <linearGradient id="aBpGlobal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25} /><stop offset="95%" stopColor="#60a5fa" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'black', fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => format(new Date(v), 'MMM dd')} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px' }} itemStyle={{ fontSize: '13px', fontWeight: 'black', color: 'hsl(var(--foreground))' }} />
                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingTop: '0px', paddingBottom: '30px' }} formatter={(v) => <span className="text-[11px] text-muted-foreground font-black uppercase tracking-widest ml-2">{v}</span>} />
                            <Area type="monotone" dataKey="avgHeartRate" name="Heart Rate" stroke="#f87171" fill="url(#aHrGlobal)" strokeWidth={4} />
                            <Area type="monotone" dataKey="avgOxygen" name="SpO₂ Sat" stroke="#34d399" fill="url(#aO2Global)" strokeWidth={4} />
                            <Area type="monotone" dataKey="avgSystolic" name="Systolic BP" stroke="#60a5fa" fill="url(#aBpGlobal)" strokeWidth={4} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings View */}
        <AnimatePresence mode="wait">
          {view === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-10"
            >
              <div>
                <h2 className="text-4xl font-black tracking-tighter text-foreground">System Control</h2>
                <p className="text-muted-foreground/80 font-medium tracking-wide">Manage thresholds, secure identity, and grid configurations.</p>
              </div>

              {/* Role Badge */}
              <div className="flex items-center gap-4">
                <Badge className={`${user.role === 'ADMIN' ? 'bg-blue-600 text-foreground' : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'} border font-black uppercase tracking-[0.2em] text-[10px] px-5 py-2 rounded-full shadow-xl`}>
                  {user.role} Clearace
                </Badge>
                <code className="text-[11px] text-muted-foreground/80 font-mono bg-muted/50 px-4 py-2 rounded-xl border border-border/50">{user.email}</code>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Threshold Configuration */}
                <Card className="bg-card backdrop-blur-3xl border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <CardHeader className="pb-6 border-b border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/10">
                        <AlertTriangle className="h-6 w-6 text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/90">Protocol Thresholds</CardTitle>
                        <CardDescription className="text-foreground font-black text-base">Vital Trigger Parameters</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 space-y-6">
                    {[
                      { label: 'Heart Rate Floor', range: '< 50 bpm', color: 'text-red-400' },
                      { label: 'Heart Rate Ceiling', range: '> 120 bpm', color: 'text-red-400' },
                      { label: 'SpO₂ Critical', range: '< 90%', color: 'text-orange-400' },
                      { label: 'Core Temp Limit', range: '> 38.5°C', color: 'text-yellow-400' },
                      { label: 'Systolic Upper', range: '> 160 mmHg', color: 'text-red-400' },
                    ].map((t, i) => (
                      <div key={i} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0 hover:bg-muted/50 -mx-4 px-4 rounded-xl transition-colors">
                        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t.label}</p>
                        <Badge className={`bg-muted/50 border border-border/50 ${t.color} font-mono font-black text-xs px-4 py-1.5 rounded-lg`}>{t.range}</Badge>
                      </div>
                    ))}
                    {user.role !== 'ADMIN' && (
                      <div className="flex items-center gap-3 pt-4 text-muted-foreground/90 italic">
                        <ShieldAlert className="h-4 w-4" />
                        <p className="text-[10px] font-medium tracking-wide">Elevated privileges required to modify clinical protocols.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Database Management */}
                <Card className="bg-card backdrop-blur-3xl border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <CardHeader className="pb-6 border-b border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/10">
                        <Database className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/90">Infrastructure</CardTitle>
                        <CardDescription className="text-foreground font-black text-base">Database Grid Operations</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 space-y-10">
                    <div className="bg-muted/50 p-8 rounded-3xl border border-border/50 group hover:border-blue-500/20 transition-all">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/80 mb-2">Signal Emulation</p>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium mb-6">Initialize the surveillance grid with simulated patient telemetry and historical anomalies for stress testing.</p>
                      <Button
                        onClick={handleSeedDatabase}
                        className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-foreground font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.2)] transition-all active:scale-95 text-xs"
                      >
                        <Zap className="h-5 w-5 mr-3" /> Initialize Grid Simulation
                      </Button>
                    </div>

                    <div className="bg-muted/50 p-8 rounded-3xl border border-border/50">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/80 mb-4">Node Credentials (Demo)</p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/60 rounded-2xl border border-border/50">
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-black">ADMIN</Badge>
                          <code className="text-[10px] text-muted-foreground/80 font-mono">admin / admin123</code>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted/60 rounded-2xl border border-border/50">
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-black">DOCTOR</Badge>
                          <code className="text-[10px] text-muted-foreground/80 font-mono">dr.smith / doctor123</code>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Session Identity */}
              <Card className="bg-card backdrop-blur-3xl border-border/50 rounded-[3rem] overflow-hidden shadow-2xl border-l-[6px] border-l-blue-500">
                <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="flex items-center gap-8">
                    <div className="p-5 bg-muted/50 rounded-3xl border border-border/50 ring-8 ring-muted/10">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-black text-foreground tracking-tighter">{user.name}</p>
                      <p className="text-sm font-bold text-muted-foreground/80 tracking-wide">{user.email} · {user.role} Node</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="h-16 border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 hover:border-red-500/40 w-full md:w-auto px-12 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-2xl"
                  >
                    <LogOut className="h-5 w-5 mr-3" /> Terminate Node Session
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
