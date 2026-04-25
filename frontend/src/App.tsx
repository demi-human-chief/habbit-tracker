import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import { RequireAuth } from './components/RequireAuth'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AppPage } from './pages/AppPage'
import { AICoachPage } from './pages/AICoachPage'
import { StatsPage } from './pages/StatsPage'
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={<LandingPage />}
          />
          <Route
            path="/login"
            element={<LoginPage />}
          />
          <Route
            path="/register"
            element={<RegisterPage />}
          />
          <Route
            path="/app"
            element={(
              <RequireAuth>
                <AppPage />
              </RequireAuth>
            )}
          />
          <Route
            path="/app/ai"
            element={(
              <RequireAuth>
                <AICoachPage />
              </RequireAuth>
            )}
          />
          <Route
            path="/app/stats"
            element={(
              <RequireAuth>
                <StatsPage />
              </RequireAuth>
            )}
          />
          <Route
            path="/app/admin/analytics"
            element={(
              <RequireAuth>
                <AdminAnalyticsPage />
              </RequireAuth>
            )}
          />
          <Route
            path="/app/profile"
            element={(
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            )}
          />
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
