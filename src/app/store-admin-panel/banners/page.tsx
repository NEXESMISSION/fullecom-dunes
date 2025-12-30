'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Banner {
  id: string
  title: string
  image: string
  link: string
  order: number
  size: 'full' | 'half' | 'third'
  height: 'tall' | 'medium' | 'short' | 'thin'
  is_active: boolean
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    image: '',
    link: '',
    order: 0,
    size: 'third' as 'full' | 'half' | 'third',
    height: 'medium' as 'tall' | 'medium' | 'short' | 'thin',
    is_active: true
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  async function fetchBanners() {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order', { ascending: true })

      if (error) throw error
      setBanners(data || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  function openModal(banner?: Banner) {
    if (banner) {
      setEditingId(banner.id)
      setForm({
        title: banner.title,
        image: banner.image,
        link: banner.link || '',
        order: banner.order,
        size: banner.size || 'third',
        height: banner.height || 'medium',
        is_active: banner.is_active
      })
    } else {
      setEditingId(null)
      setForm({
        title: '',
        image: '',
        link: '',
        order: banners.length,
        size: 'third',
        height: 'medium',
        is_active: true
      })
    }
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.image.trim()) {
      toast.error('العنوان والصورة مطلوبان')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        const { error } = await supabase
          .from('banners')
          .update({
            title: form.title,
            image: form.image,
            link: form.link || null,
            order: form.order,
            size: form.size,
            height: form.height,
            is_active: form.is_active
          })
          .eq('id', editingId)

        if (error) throw error
        toast.success('تم التحديث')
      } else {
        const { error } = await supabase
          .from('banners')
          .insert({
            title: form.title,
            image: form.image,
            link: form.link || null,
            order: form.order,
            size: form.size,
            height: form.height,
            is_active: form.is_active
          })

        if (error) throw error
        toast.success('تم الإضافة')
      }
      setShowModal(false)
      fetchBanners()
    } catch (error: any) {
      toast.error(error.message || 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  async function deleteBanner(id: string) {
    if (!confirm('هل تريد حذف هذا البانر؟')) return
    try {
      const { error } = await supabase.from('banners').delete().eq('id', id)
      if (error) throw error
      setBanners(banners.filter(b => b.id !== id))
      toast.success('تم الحذف')
    } catch (error) {
      toast.error('فشل الحذف')
    }
  }

  async function toggleActive(id: string, currentState: boolean) {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !currentState })
        .eq('id', id)

      if (error) throw error
      setBanners(banners.map(b => b.id === id ? { ...b, is_active: !currentState } : b))
    } catch (error) {
      toast.error('فشل التحديث')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-lg h-24" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">البانرات الإعلانية</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + إضافة بانر
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          لا توجد بانرات بعد
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                {!banner.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">معطل</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium truncate">{banner.title}</h3>
                <p className="text-xs text-gray-500 truncate">{banner.link || 'بدون رابط'}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openModal(banner)}
                    className="flex-1 py-1.5 border rounded text-sm hover:bg-gray-50"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => toggleActive(banner.id, banner.is_active)}
                    className={`py-1.5 px-3 border rounded text-sm ${
                      banner.is_active ? 'text-amber-600 border-amber-200' : 'text-green-600 border-green-200'
                    }`}
                  >
                    {banner.is_active ? 'تعطيل' : 'تفعيل'}
                  </button>
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="py-1.5 px-3 border border-red-200 text-red-600 rounded text-sm hover:bg-red-50"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">{editingId ? 'تعديل البانر' : 'إضافة بانر'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">العنوان *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="عنوان البانر"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">رابط الصورة *</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="https://..."
                  dir="ltr"
                />
                {form.image && (
                  <img src={form.image} alt="معاينة" className="mt-2 w-full h-32 object-cover rounded border" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">رابط الانتقال (اختياري)</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={e => setForm({ ...form, link: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="https://... أو /products"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">الترتيب</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">العرض</label>
                  <select
                    value={form.size}
                    onChange={e => setForm({ ...form, size: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="full">كامل العرض</option>
                    <option value="half">نصف العرض</option>
                    <option value="third">ثلث العرض</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">الارتفاع</label>
                <select
                  value={form.height}
                  onChange={e => setForm({ ...form, height: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="tall">عالي (16:9)</option>
                  <option value="medium">متوسط (2:1)</option>
                  <option value="short">قصير (3:1)</option>
                  <option value="thin">رفيع (4:1)</option>
                </select>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">نشط (يظهر في الصفحة الرئيسية)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
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
