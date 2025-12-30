// Form field types for dynamic product forms
export type FormFieldType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'file'

export interface FormField {
  id: string
  label: string
  type: FormFieldType
  required: boolean
  options?: string[]
  placeholder?: string
  min?: number
  max?: number
}

export interface FormSchema {
  fields: FormField[]
}

export interface ProductType {
  id: string
  name: string
  slug: string
  form_schema: FormSchema
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string | null
  description: string
  price: number
  image: string
  category: string
  stock: number
  product_type_id: string | null
  product_type?: ProductType
  is_active: boolean
  created_at: string
}

export interface ProductOptions {
  [key: string]: string | number | boolean | string[]
}

export interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image: string
  options: ProductOptions
  optionsKey: string // unique key for same product with different options
}

export interface Order {
  id: string
  customer_name: string
  phone: string
  city: string
  address: string
  notes: string | null
  total_price: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  price: number
  quantity: number
  options: ProductOptions
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
}
