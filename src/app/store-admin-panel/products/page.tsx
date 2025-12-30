'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [productTypes, setProductTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '',
    image: '', product_type_id: '', is_active: true
  })

  useEffect(() => {
    fetchProducts()
    fetchProductTypes()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*, product_type:product_types(id, name)')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  async function fetchProductTypes() {
    const { data } = await supabase.from('product_types').select('*').order('name')
    setProductTypes(data || [])
  }

  function openModal(product?: any) {
    if (product) {
      setEditingId(product.id)
      setForm({
        name: product.name, description: product.description || '',
        price: product.price.toString(), stock: product.stock.toString(),
        image: product.image || '',
        product_type_id: product.product_type_id || '', is_active: product.is_active !== false
      })
    } else {
      setEditingId(null)
      setForm({ name: '', description: '', price: '', stock: '', image: '', product_type_id: '', is_active: true })
    }
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        name: form.name, description: form.description,
        price: parseFloat(form.price), stock: parseInt(form.stock),
        image: form.image,
        product_type_id: form.product_type_id || null, is_active: form.is_active
      }
      if (editingId) {
        const { error } = await supabase.from('products').update(data).eq('id', editingId)
        if (error) throw error
        toast.success('تم تحديث المنتج')
      } else {
        const { error } = await supabase.from('products').insert(data)
        if (error) throw error
        toast.success('تم إنشاء المنتج')
      }
      setShowModal(false)
      fetchProducts()
    } catch (error: any) {
      toast.error(error.message || 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('هل تريد حذف هذا المنتج؟')) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      setProducts(products.filter(p => p.id !== id))
      toast.success('تم الحذف')
    } catch (error) {
      toast.error('فشل الحذف')
    }
  }

  if (loading) return <div className="animate-pulse grid grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-lg h-48" />)}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">المنتجات</h1>
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + إضافة منتج
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">لا توجد منتجات بعد</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {p.image ? (
                  <Image src={p.image} alt={p.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500">{p.product_type?.name || 'بدون نوع'}</p>
                <h3 className="font-medium truncate">{p.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-blue-600">{p.price.toFixed(2)} د.ت</span>
                  <span className={`text-xs ${p.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {p.stock > 0 ? `${p.stock} متوفر` : 'نفذ المخزون'}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openModal(p)} className="flex-1 py-1.5 border rounded text-sm hover:bg-gray-50">تعديل</button>
                  <button onClick={() => deleteProduct(p.id)} className="py-1.5 px-3 border border-red-200 text-red-600 rounded text-sm hover:bg-red-50">🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">{editingId ? 'تعديل المنتج' : 'إضافة منتج'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">السعر *</label>
                  <input type="number" step="0.01" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">المخزون *</label>
                  <input type="number" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نوع المنتج *</label>
                <select required value={form.product_type_id} onChange={e => setForm({...form, product_type_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">اختر نوع...</option>
                  {productTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رابط الصورة</label>
                <input type="url" value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="rounded" />
                <span className="text-sm">نشط (مرئي للعملاء)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">إلغاء</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
