import axios from 'axios'

const BASE_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

interface Supplier {
  id?: number
  supplierName: string
  tin?: string
  businessRegNo?: string
  primaryContact: string
  primaryContactNumber: string
  secondaryContact?: string
  secondaryContactNumber?: string
  email: string
  alternativeEmail?: string
  website?: string
  address: string
  productCategories: string[]
  paymentTerms: string
  creditLimit: number
  leadTime?: string
  status: 'Active' | 'Inactive'
  supplyRating?: number
  qualityRating?: number
  deliveryRating?: number
  lastSupplyDate?: string
  paymentMethod: string
}

interface Employee {
  id?: number
  employeeId: string
  firstName: string
  lastName: string
  email: string
  contactNumber: string
  position: string
  department: string
  dateHired: string
  status: 'Active' | 'Inactive'
}

interface Attendance {
  id?: number
  employeeId: string
  date: string
  timeIn?: string
  timeOut?: string
  status: 'Present' | 'Late' | 'Absent'
  firstName?: string
  lastName?: string
}

interface Client {
  id?: number
  clientName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  status: 'Active' | 'Inactive'
}

interface Order {
  id?: number
  clientId: number
  orderDate: string
  totalAmount: number
  status: 'Pending' | 'Completed' | 'Cancelled'
}

interface InventoryItem {
  id?: number
  itemName: string
  description?: string
  quantity: number
  unitPrice: number
  category: string
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
}

// API Methods
export const clientAPI = {
  getAll: () => axios.get<{ success: boolean; data: Client[] }>(`${BASE_URL}/clients`),
  getById: (id: number) => axios.get<{ success: boolean; data: Client }>(`${BASE_URL}/clients/${id}`),
  create: (data: Omit<Client, 'id'>) => axios.post<{ success: boolean; data: Client }>(`${BASE_URL}/clients`, data),
  update: (id: number, data: Partial<Client>) => axios.put<{ success: boolean; data: Client }>(`${BASE_URL}/clients/${id}`, data),
  getClientOrders: (id: number) => axios.get<{ success: boolean; data: Order[] }>(`${BASE_URL}/clients/${id}/orders`),
}

export const orderAPI = {
  getAll: () => axios.get<{ success: boolean; data: Order[] }>(`${BASE_URL}/orders`),
  getById: (id: number) => axios.get<{ success: boolean; data: Order }>(`${BASE_URL}/orders/${id}`),
  getByClientId: (clientId: number) => axios.get<{ success: boolean; data: Order[] }>(`${BASE_URL}/orders/client/${clientId}`),
  create: (data: Omit<Order, 'id'>) => axios.post<{ success: boolean; data: Order }>(`${BASE_URL}/orders`, data),
  update: (id: number, data: Partial<Order>) => axios.put<{ success: boolean; data: Order }>(`${BASE_URL}/orders/${id}`, data),
}

export const inventoryAPI = {
  getAll: () => axios.get<{ success: boolean; data: InventoryItem[] }>(`${BASE_URL}/inventory`),
  getById: (id: number) => axios.get<{ success: boolean; data: InventoryItem }>(`${BASE_URL}/inventory/${id}`),
  create: (data: Omit<InventoryItem, 'id'>) => axios.post<{ success: boolean; data: InventoryItem }>(`${BASE_URL}/inventory`, data),
  update: (id: number, data: Partial<InventoryItem>) => axios.put<{ success: boolean; data: InventoryItem }>(`${BASE_URL}/inventory/${id}`, data),
  createTransaction: (data: Record<string, unknown>) => axios.post(`${BASE_URL}/inventory/transactions`, data),
  getTransactions: (id: number) =>
    axios.get(`${BASE_URL}/inventory/${id}/transactions`)
      .then(response => {
        console.log('API Transaction Response:', response.data)
        return response.data
      })
      .catch(error => {
        console.error('API Transaction Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        throw error
      })
}

export const supplierAPI = {
  getAll: () => axios.get<{ success: boolean; data: Supplier[] }>(`${BASE_URL}/suppliers`),
  getById: (id: number) => axios.get<{ success: boolean; data: Supplier }>(`${BASE_URL}/suppliers/${id}`),
  create: (data: Omit<Supplier, 'id'>) => axios.post<{ success: boolean; data: Supplier }>(`${BASE_URL}/suppliers`, data),
  update: (id: number, data: Partial<Supplier>) => axios.put<{ success: boolean; data: Supplier }>(`${BASE_URL}/suppliers/${id}`, data)
}

export const employeeAPI = {
  getAll: () => axios.get<{ success: boolean; data: Employee[] }>(`${BASE_URL}/employee`),
  getById: (id: number) => axios.get<{ success: boolean; data: Employee }>(`${BASE_URL}/employee/${id}`),
  create: (data: Omit<Employee, 'id'>) => 
    axios.post<{ success: boolean; data: Employee }>(`${BASE_URL}/employee`, data),
  update: (id: number, data: Partial<Employee>) => 
    axios.put<{ success: boolean; data: Employee }>(`${BASE_URL}/employee/${id}`, data),
}

export const attendanceAPI = {
  getMorningAttendance: (date: string) => 
    axios.get<{ success: boolean; data: Attendance[] }>(`${BASE_URL}/attendance/morning/${date}`),
  
  getAfternoonAttendance: (date: string) => 
    axios.get<{ success: boolean; data: Attendance[] }>(`${BASE_URL}/attendance/afternoon/${date}`),
  
  recordMorningAttendance: (data: Omit<Attendance, 'id'>) => 
    axios.post<{ success: boolean; data: Attendance }>(`${BASE_URL}/attendance/morning`, data),
  
  recordAfternoonAttendance: (data: Omit<Attendance, 'id'>) => 
    axios.post<{ success: boolean; data: Attendance }>(`${BASE_URL}/attendance/afternoon`, data),

  getAttendanceReport: (startDate: string, endDate: string) => 
    axios.get<{ success: boolean; data: Attendance[] }>(`${BASE_URL}/attendance/report`, {
      params: { startDate, endDate }
    })
}

export default api