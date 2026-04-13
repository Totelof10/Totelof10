import { useEffect } from 'react'
import AppRoutes from './router/Routes'
import { useLocation } from 'react-router-dom'
import NavBar from './components/navbar/NavBar'
import { OrderProvider } from './features/order/context/OrderContext'
import { ProductProvider } from './features/product/context/ProductContext'
import { SupplierProvider } from './features/supplier/context/SupplierContext'
import { CustomerProvider } from './features/customer/context/CustomerContext'
import AppToastContainer from './components/AppToastContainer'
import { configureAppToast } from './services/appToast'
import { useTheme } from './context/ThemeContext'
import { FaMoon, FaSun } from 'react-icons/fa'
//import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import 'react-toastify/dist/ReactToastify.css'

function ThemeToggleButton() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9998,
        width: '2.5rem',
        height: '2.5rem',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.15rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
        background: isDark ? '#1e293b' : '#ffffff',
        color: isDark ? '#facc15' : '#3b82f6',
        transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
      }}
    >
      {isDark ? <FaSun /> : <FaMoon />}
    </button>
  );
}

function App() {
  const location = useLocation();
  const showNavBar = location.pathname !== '/' && location.pathname !== '/register' && location.pathname !== '/forgot-password';
  const isAuthPage = location.pathname === '/' || location.pathname === '/register' || location.pathname === '/forgot-password';

  useEffect(() => {
    configureAppToast(() => window.location.pathname);
  }, []);
  
  return (
    <OrderProvider>
      <ProductProvider>
        <SupplierProvider>
          <CustomerProvider>
        <div className='app-container'>
          <AppToastContainer />
          <ThemeToggleButton />
          {showNavBar && <NavBar />}
          {isAuthPage ? (
            <AppRoutes />
          ) : (
            <div className='main-content'>
              <AppRoutes />
            </div>
          )}
        </div>
        </CustomerProvider>
        </SupplierProvider>
      </ProductProvider>
    </OrderProvider>
  )
}

export default App
