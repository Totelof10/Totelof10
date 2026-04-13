import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Login from '../features/auth/pages/Login'
import Register from '../features/auth/pages/Register'
import CustomerList from '../features/customer/pages/CustomerList'
import CreateCustomer from '../features/customer/pages/CreateCustomer'
import DetailCustomer from '../features/customer/pages/DetailCustomer'
import EditCustomer from '../features/customer/pages/EditCustomer'
import Product from '../features/product/pages/Product'
import DashBoard from '../features/dashboard/pages/DashBoard'
import ForgotPassword from '../features/auth/pages/ForgotPassword'
import Order from '../features/order/pages/Order'
import DetailOrder from '../features/order/pages/DetailOrder'
import CreateOrder from '../features/order/pages/CreateOrder'
import Invoice from '../features/order/pages/Invoice'
import CreateProduct from '../features/product/pages/CreateProduct'
import DetailProduct from '../features/product/pages/DetailProduct'
import CreateSupplier from '../features/supplier/pages/CreateSupplier'
import DetailSupplier from '../features/supplier/pages/DetailSupplier'
import EditSupplier from '../features/supplier/pages/EditSupplier'
import SupplierList from '../features/supplier/pages/SupplierList'
import Tiers from '../features/tiers/Tiers'
import PrivateRoute from './PrivateRoute'
import EditProduct from '../features/product/pages/EditProduct'
import Charge from '../features/charge/pages/Charge'
import NotFoundPage from '../components/NotFoundPage'
import Facture from '../features/facture/pages/Facture'
import CreateFacture from '../features/facture/pages/CreateFacture'
import DetailsFacture from '../features/facture/pages/DetailsFacture'

function AppRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={<PrivateRoute><DashBoard /></PrivateRoute>} />
                <Route path="/tiers" element={<PrivateRoute><Tiers /></PrivateRoute>} />
                <Route path="/charges" element={<PrivateRoute><Charge /></PrivateRoute>} />
                <Route path="/product" element={<PrivateRoute><Product /></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><Order /></PrivateRoute>} />
                <Route path="/order/:id/detail" element={<PrivateRoute><DetailOrder /></PrivateRoute>} />
                <Route path="/order/create" element={<PrivateRoute><CreateOrder /></PrivateRoute>} />
                <Route path="/order/:id/invoice" element={<PrivateRoute><Invoice /></PrivateRoute>} />
                <Route path="/product/create" element={<PrivateRoute><CreateProduct /></PrivateRoute>} />
                <Route path="/product/:id/detail" element={<PrivateRoute><DetailProduct /></PrivateRoute>} />
                <Route path="/supplier/create" element={<PrivateRoute><CreateSupplier /></PrivateRoute>} />
                <Route path="/supplier/:id/detail" element={<PrivateRoute><DetailSupplier /></PrivateRoute>} />
                <Route path="/supplier/:id/edit" element={<PrivateRoute><EditSupplier /></PrivateRoute>} />
                <Route path="/customer/create" element={<PrivateRoute><CreateCustomer /></PrivateRoute >} />
                <Route path="/customer/:id/detail" element={<PrivateRoute><DetailCustomer /></PrivateRoute>} />
                <Route path="/customer/:id/edit" element={<PrivateRoute><EditCustomer /></PrivateRoute>} />
                <Route path="/supplier" element={<PrivateRoute><SupplierList /></PrivateRoute>} />
                <Route path="/customer" element={<PrivateRoute><CustomerList /></PrivateRoute>} />
                <Route path="/product/:id/edit" element={<PrivateRoute><EditProduct /></PrivateRoute>} />
                <Route path="/facture" element={<PrivateRoute><Facture/></PrivateRoute>}/>
                <Route path="/facture/create" element={<PrivateRoute><CreateFacture/></PrivateRoute>}/>
                <Route path="/facture/:id/detail" element={<PrivateRoute><DetailsFacture/></PrivateRoute>}/>
                <Route path="*" element={<NotFoundPage/>}/>
            </Routes>
        </AnimatePresence>
    )
}

export default AppRoutes