import { Navigate } from 'react-router-dom'
import { isLoggedIn } from '../services/AUTH'

const PrivateRoute = ({ children }) => {
    return isLoggedIn() ? children : <Navigate to="/" />
}

export default PrivateRoute