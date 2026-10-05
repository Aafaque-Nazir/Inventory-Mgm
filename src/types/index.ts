export type Role = 'STOREKEEPER' | 'MANAGER' | 'ADMIN'

export interface Profile {
    id: string
    full_name: string | null
    role: Role | null
    is_super_admin?: boolean
    organization_id?: string
    created_at: string
    organization?: {
        plan_type: string
    }
}

export interface Item {
    id: string
    name: string
    sku: string
    category: string | null
    unit: string
    min_stock: number
    max_stock: number | null
    current_stock: number
    cost_price: number // New field
    selling_price: number // New field
    size?: string | null
    color?: string | null
    hsn_code?: string | null
    gst_rate?: number
    created_at: string
    updated_at: string
}

export interface Supplier {
    id: string
    name: string
    contact_person: string | null
    phone: string | null
    email: string | null
    address: string | null
    created_at: string
}

export type PurchaseOrderStatus = 'DRAFT' | 'APPROVED' | 'RECEIVED' | 'CANCELLED'

export interface PurchaseOrder {
    id: string
    supplier_id: string | null
    status: PurchaseOrderStatus
    total_amount: number
    created_by: string | null
    approved_by: string | null
    created_at: string
    updated_at: string
    supplier?: Supplier // Joined
    items?: PurchaseOrderItem[] // Joined
}

export interface PurchaseOrderItem {
    id: string
    order_id: string
    item_id: string
    quantity: number
    price: number
    line_total: number
    item?: Item // Joined
}

export type StockMovementType = 'IN' | 'OUT'

export interface StockMovement {
    id: string
    item_id: string
    quantity: number
    type: StockMovementType
    reason: string | null
    reference_id: string | null
    unit_price?: number // New field (at time of movement)
    created_by: string | null
    created_at: string
    item?: Item // Joined
    profile?: Profile // Joined (created_by)
}

export interface AuditLog {
    id: string
    organization_id: string
    actor_id: string | null
    action: string
    entity_type: string
    entity_id: string | null
    details: Record<string, unknown>
    created_at: string
    profile?: Profile // Joined
}

export interface InvoiceItem {
    item_id: string
    name: string
    quantity: number
    unit_price: number
    total: number
    cost_price?: number // Snapshot cost price at time of sale for accurate P&L
    hsn_code?: string | null
    gst_rate?: number
    batch_number?: string | null
    expiry_date?: string | null
}

export interface Invoice {
    id: string
    created_at: string
    organization_id: string
    customer_id?: string | null
    customer_name: string | null
    customer_phone: string | null
    total_amount: number
    subtotal?: number | null
    tax_amount?: number | null
    cgst_amount?: number | null
    sgst_amount?: number | null
    igst_amount?: number | null
    payment_method: 'CASH' | 'UPI' | 'CARD' | 'OTHER'
    status?: 'PAID' | 'PARTIALLY_PAID' | 'RETURNED' | 'CANCELLED'
    notes?: string | null
    items: InvoiceItem[]
    created_by: string
    profile?: Profile // Joined
    customer?: Customer // Joined
}

export interface Customer {
    id: string
    organization_id: string
    name: string
    phone?: string | null
    email?: string | null
    address?: string | null
    gstin?: string | null
    total_spent: number
    total_orders: number
    notes?: string | null
    created_at: string
    updated_at: string
}

export interface ItemBatch {
    id: string
    organization_id: string
    item_id: string
    batch_number: string
    expiry_date?: string | null
    manufacturing_date?: string | null
    quantity: number
    location_id?: string | null
    created_at: string
    updated_at: string
    item?: Item
}

export interface SalesReturnItem {
    item_id: string
    name: string
    quantity: number
    unit_price: number
    refund_amount: number
    restock: boolean
    condition: 'RESTOCKABLE' | 'DAMAGED'
}

export interface SalesReturn {
    id: string
    organization_id: string
    invoice_id?: string | null
    customer_name?: string | null
    customer_phone?: string | null
    total_refund_amount: number
    refund_method: 'CASH' | 'UPI' | 'CREDIT_NOTE' | 'OTHER'
    reason?: string | null
    items: SalesReturnItem[]
    created_by?: string | null
    created_at: string
    invoice?: Invoice
}

