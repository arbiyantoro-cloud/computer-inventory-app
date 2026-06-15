import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ user, role, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.user_metadata?.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PrivateRoute
