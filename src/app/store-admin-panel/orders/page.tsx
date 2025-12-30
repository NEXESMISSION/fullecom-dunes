'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const STATUSES = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  async function fetchOrders() {
    setLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query
      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1,2,3].map(i => <div key={i} className="bg-white rounded-lg h-20" />)}
    </div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-white"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500">{orders.length} orders</p>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">No orders found</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-gray-500">#{order.id.slice(0, 8)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-sm text-gray-500">{order.phone} • {order.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">${order.total_price?.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {expandedId === order.id && (
                <div className="border-t p-4 bg-gray-50 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Address</p>
                    <p className="text-sm text-gray-600">{order.address}</p>
                  </div>
                  {order.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Notes</p>
                      <p className="text-sm text-gray-600">{order.notes}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
                    <div className="bg-white rounded border divide-y">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="p-2 flex justify-between text-sm">
                          <span>{item.product_name} × {item.quantity}</span>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="px-3 py-1.5 border rounded text-sm bg-white"
                    >
                      {STATUSES.filter(s => s !== 'all').map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    <a href={`tel:${order.phone}`} className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100">
                      📞 Call
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
