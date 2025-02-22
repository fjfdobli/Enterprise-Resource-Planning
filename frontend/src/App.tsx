import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Client from './pages/Client'
import Order from './pages/Order'
import Inventory from './pages/Inventory'
import Supplier from './pages/Supplier'
import Attendance from './pages/Employee'
import MorningAttendance from './pages/morningAttendance'
import AfternoonAttendance from './pages/afternoonAttendance'
import Payroll from './pages/Payroll'
import Machinery from './pages/Machinery'
import Reports from './pages/Reports'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Client />} />
          <Route path="orders" element={<Order />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="supplier" element={<Supplier />} />
          <Route path="attendance" element={<Attendance />} />
      <Route path="attendance">
          <Route index element={<Attendance />} />
          <Route path="morning" element={<MorningAttendance />} />
          <Route path="afternoon" element={<AfternoonAttendance />} />
      </Route>
          <Route path="payroll" element={<Payroll />} />
          <Route path="machinery" element={<Machinery />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App