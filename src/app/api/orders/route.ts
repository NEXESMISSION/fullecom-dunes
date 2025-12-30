import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create admin client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface OrderItem {
  product_id: string | null
  product_name: string
  price: number
  quantity: number
  options: Record<string, unknown> | null
}

interface OrderRequest {
  customer_name: string
  phone: string
  city: string
  address: string
  notes: string | null
  total_price: number
  items: OrderItem[]
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json()

    // Validate required fields
    if (!body.customer_name || !body.phone || !body.city || !body.address) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      )
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'السلة فارغة' },
        { status: 400 }
      )
    }

    // Create order using admin client (bypasses RLS)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name: body.customer_name.trim(),
        phone: body.phone.trim(),
        city: body.city.trim(),
        address: body.address.trim(),
        notes: body.notes?.trim() || null,
        total_price: body.total_price,
        status: 'pending',
      })
      .select('id')
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: 'فشل في إنشاء الطلب', details: orderError.message },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = body.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      price: item.price,
      quantity: item.quantity,
      options: item.options,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items error:', itemsError)
      // Don't fail - order was created
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم', details: String(error) },
      { status: 500 }
    )
  }
}
