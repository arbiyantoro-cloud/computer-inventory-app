import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './config/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import TechnisianPanel from './pages/TechnisianPanel'
import PrivateRoute from './components/PrivateRoute'
import Loading from './components/Shared/Loading'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          const { data } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
          setUserRole(data?.role || 'teknisi')
        }
      } catch (error) {
        console.error('Auth error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) return <Loading />

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={<PrivateRoute user={user}><Dashboard /></PrivateRoute>} />
        <Route path="/admin/*" element={<PrivateRoute user={user} role="admin"><AdminPanel /></PrivateRoute>} />
        <Route path="/technician/*" element={<PrivateRoute user={user} role="teknisi"><TechnisianPanel /></PrivateRoute>} />
      </Routes>
    </Router>
  )
}

export default App
