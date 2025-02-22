export interface InventoryItem {
    id: number
    itemName: string
    description: string
    currentStock: number
    minimumStock: number
    unit: string
    category: string
  }
  
  export interface StockTransaction {
    id: number
    inventoryItemId: number
    transactionType: 'Stock In' | 'Stock Out'
    quantity: number
    date: string
    reason: string
  }