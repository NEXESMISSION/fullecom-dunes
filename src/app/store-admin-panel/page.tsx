'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, pendingRes, revenueRes, productsRes, recentRes] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('orders').select('total_price').in('status', ['confirmed', 'shipped', 'delivered']),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        ])

        const revenue = revenueRes.data?.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0) || 0

        setStats({
          totalOrders: ordersRes.count || 0,
          pendingOrders: pendingRes.count || 0,
          totalRevenue: revenue,
          totalProducts: productsRes.count || 0,
        })
        setRecentOrders(recentRes.data || [])
      } catch (error) {
        console.error('Dashboard error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="bg-white rounded-lg h-24" />)}
        </div>
        <div className="bg-white rounded-lg h-64" />
      </div>
    )
  }

  const statCards = [
    { title: 'Total Orders', value: stats.totalOrders, color: 'bg-blue-500', href: '/store-admin-panel/orders' },
    { title: 'Pending', value: stats.pendingOrders, color: 'bg-amber-500', href: '/store-admin-panel/orders' },
    { title: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: 'bg-green-500', href: '/store-admin-panel/orders' },
    { title: 'Products', value: stats.totalProducts, color: 'bg-purple-500', href: '/store-admin-panel/products' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg`}>
                {stat.title === 'Total Orders' && '📦'}
                {stat.title === 'Pending' && '⏳'}
                {stat.title === 'Revenue' && '💰'}
                {stat.title === 'Products' && '🛍️'}
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/store-admin-panel/orders" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">No orders yet</p>
        ) : (
          <div className="divide-y">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-sm text-gray-500">{order.city}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${order.total_price?.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
