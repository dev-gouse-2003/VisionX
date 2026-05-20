import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProfile } from '@/store/slices/authSlice'

// Layouts
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import ComplaintsManagement from '@/pages/admin/ComplaintsManagement'
import DepartmentManagement from '@/pages/admin/DepartmentManagement'
import OfficerManagement from '@/pages/admin/OfficerManagement'
import AnalyticsPage from '@/pages/admin/AnalyticsPage'
import ReportsPage from '@/pages/admin/ReportsPage'
import AuditLogsPage from '@/pages/admin/AuditLogsPage'

// Officer Pages
import OfficerDashboard from '@/pages/officer/OfficerDashboard'
import AssignedComplaints from '@/pages/officer/AssignedComplaints'

// Citizen Pages
import CitizenDashboard from '@/pages/citizen/CitizenDashboard'
import SubmitComplaint from '@/pages/citizen/SubmitComplaint'
import MyComplaints from '@/pages/citizen/MyComplaints'
import ComplaintDetail from '@/pages/citizen/ComplaintDetail'
import TrackComplaint from '@/pages/citizen/TrackComplaint'

// Shared
import NotFoundPage from '@/pages/NotFoundPage'
import LoadingScreen from '@/components/ui/LoadingScreen'

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useSelector(state => state.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }
  return children
}

function RoleRedirect() {
  const { user } = useSelector(state => state.auth)
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={`/${user.role}/dashboard`} replace />
}

export default function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector(state => state.auth)

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchProfile())
    }
  }, [isAuthenticated, user, dispatch])

  if (isAuthenticated && !user) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Role redirect */}
      <Route path="/" element={
        isAuthenticated ? <RoleRedirect /> : <Navigate to="/login" replace />
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="complaints" element={<ComplaintsManagement />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="officers" element={<OfficerManagement />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* Officer routes */}
      <Route path="/officer" element={
        <ProtectedRoute roles={['officer']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<OfficerDashboard />} />
        <Route path="complaints" element={<AssignedComplaints />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
      </Route>

      {/* Citizen routes */}
      <Route path="/citizen" element={
        <ProtectedRoute roles={['citizen']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="submit" element={<SubmitComplaint />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
        <Route path="track" element={<TrackComplaint />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
