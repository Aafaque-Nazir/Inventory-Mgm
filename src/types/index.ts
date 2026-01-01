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
