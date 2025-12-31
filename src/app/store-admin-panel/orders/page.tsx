'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'

const STATUSES = [
  { value: 'all', label: 'Tous', color: 'bg-gray-100 text-gray-700' },
  { value: 'pending', label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  { value: 'confirmed', label: 'Confirmé', color: 'bg-blue-100 text-primary-700' },
  { value: 'shipped', label: 'Expédié', color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Livré', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Annulé', color: 'bg-red-100 text-red-700' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
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
      toast.error('Erreur de chargement')
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
      toast.success('Statut mis à jour')
    } catch (error) {
      toast.error('Erreur de mise à jour')
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

  // Filter orders by search query
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      order.customer_name?.toLowerCase().includes(query) ||
      order.phone?.includes(query) ||
      order.city?.toLowerCase().includes(query) ||
      order.id?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Commandes</h1>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, ville..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pr-10 border rounded-lg bg-white"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                statusFilter === s.value
                  ? s.color + ' ring-2 ring-offset-1 ring-current'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500">{filteredOrders.length} commande(s)</p>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          {searchQuery ? 'Aucun résultat' : 'Aucune commande'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
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
                    <p className="font-bold text-primary-600">{order.total_price?.toFixed(2)} DT</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {expandedId === order.id && (
                <div className="border-t p-4 bg-gray-50 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Adresse</p>
                    <p className="text-sm text-gray-600">{order.address}</p>
                  </div>
                  {order.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Notes</p>
                      <p className="text-sm text-gray-600">{order.notes}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Produits ({order.order_items?.length || 0})</p>
                    <div className="bg-white rounded border divide-y">
                      {(!order.order_items || order.order_items.length === 0) && (
                        <div className="p-3 text-sm text-gray-500 text-center">Aucun produit</div>
                      )}
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="p-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{item.product_name} × {item.quantity}</span>
                            <span className="font-medium text-primary-600">{(item.price * item.quantity).toFixed(2)} DT</span>
                          </div>
                          {/* Product options/form fields */}
                          {item.options && Object.keys(item.options).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-dashed">
                              <p className="text-xs text-gray-500 mb-1">Options:</p>
                              <div className="grid grid-cols-2 gap-1">
                                {Object.entries(item.options).map(([key, value]) => (
                                  <div key={key} className="text-xs">
                                    <span className="text-gray-500">{key}:</span>{' '}
                                    <span className="text-gray-800">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
                      {STATUSES.filter(s => s.value !== 'all').map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <a href={`tel:${order.phone}`} className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100">
                      📞 Appeler
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
