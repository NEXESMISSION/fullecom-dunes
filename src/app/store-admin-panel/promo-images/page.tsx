'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface PromoImage {
  id: string
  title: string
  image: string
  link: string
  link_type: 'url' | 'category' | 'none'
  category_id: string | null
  order: number
  size: 'full' | 'half' | 'third'
  is_active: boolean
}

interface Category {
  id: string
  name: string
}

export default function PromoImagesPage() {
  const [images, setImages] = useState<PromoImage[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    image: '',
    link: '',
    link_type: 'none' as 'url' | 'category' | 'none',
    category_id: '' as string,
    order: 0,
    size: 'third' as 'full' | 'half' | 'third',
    is_active: true
  })

  useEffect(() => {
    fetchImages()
  }, [])

  async function fetchImages() {
    try {
      const [imagesRes, categoriesRes] = await Promise.all([
        supabase.from('promo_images').select('*').order('order', { ascending: true }),
        supabase.from('product_types').select('id, name').order('name')
      ])

      if (imagesRes.error) throw imagesRes.error
      setImages(imagesRes.data || [])
      setCategories(categoriesRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  function openModal(img?: PromoImage) {
    if (img) {
      setEditingId(img.id)
      setForm({
        title: img.title,
        image: img.image,
        link: img.link || '',
        link_type: img.link_type || 'none',
        category_id: img.category_id || '',
        order: img.order,
        size: img.size || 'third',
        is_active: img.is_active
      })
    } else {
      setEditingId(null)
      setForm({
        title: '',
        image: '',
        link: '',
        link_type: 'none',
        category_id: '',
        order: images.length,
        size: 'third',
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
      // Build the final link based on link_type
      let finalLink = ''
      if (form.link_type === 'category' && form.category_id) {
        const category = categories.find(c => c.id === form.category_id)
        finalLink = `/products?category=${encodeURIComponent(category?.name || '')}`
      } else if (form.link_type === 'url') {
        finalLink = form.link
      }

      const saveData = {
        title: form.title,
        image: form.image,
        link: finalLink || null,
        link_type: form.link_type,
        category_id: form.link_type === 'category' ? form.category_id : null,
        order: form.order,
        size: form.size,
        is_active: form.is_active
      }

      if (editingId) {
        const { error } = await supabase
          .from('promo_images')
          .update(saveData)
          .eq('id', editingId)

        if (error) throw error
        toast.success('تم التحديث')
      } else {
        const { error } = await supabase
          .from('promo_images')
          .insert(saveData)

        if (error) throw error
        toast.success('تم الإضافة')
      }
      setShowModal(false)
      fetchImages()
    } catch (error: any) {
      toast.error(error.message || 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  async function deleteImage(id: string) {
    if (!confirm('هل تريد حذف هذه الصورة؟')) return
    try {
      const { error } = await supabase.from('promo_images').delete().eq('id', id)
      if (error) throw error
      setImages(images.filter(i => i.id !== id))
      toast.success('تم الحذف')
    } catch (error) {
      toast.error('فشل الحذف')
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
        <div>
          <h1 className="text-2xl font-bold">صور ترويجية</h1>
          <p className="text-sm text-gray-500">صور تظهر في الصفحة الرئيسية وتؤدي إلى روابط أو فئات</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          + إضافة صورة
        </button>
      </div>

      {images.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          لا توجد صور ترويجية بعد
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={img.image}
                  alt={img.title}
                  className="w-full h-full object-cover"
                />
                {!img.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">معطل</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium truncate text-sm">{img.title}</h3>
                <p className="text-xs text-gray-500 truncate">{img.link || 'بدون رابط'}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => openModal(img)}
                    className="flex-1 py-1 border rounded text-xs hover:bg-gray-50"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="py-1 px-2 border border-red-200 text-red-600 rounded text-xs hover:bg-red-50"
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
              <h2 className="font-semibold">{editingId ? 'تعديل الصورة' : 'إضافة صورة'}</h2>
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
                  placeholder="مثال: تخفيضات الشتاء"
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
                <label className="block text-sm font-medium mb-1">نوع الرابط</label>
                <div className="flex gap-2 mb-2">
                  {[
                    { value: 'none', label: 'بدون رابط' },
                    { value: 'category', label: 'فئة منتجات' },
                    { value: 'url', label: 'رابط مخصص' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, link_type: opt.value as any })}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                        form.link_type === opt.value 
                          ? 'bg-primary-600 text-white border-primary-600' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {form.link_type === 'category' && (
                  <select
                    value={form.category_id}
                    onChange={e => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">-- اختر فئة --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                )}

                {form.link_type === 'url' && (
                  <input
                    type="text"
                    value={form.link}
                    onChange={e => setForm({ ...form, link: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://... أو /products"
                    dir="ltr"
                  />
                )}
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
                  <label className="block text-sm font-medium mb-1">الحجم</label>
                  <select
                    value={form.size}
                    onChange={e => setForm({ ...form, size: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="full">كامل العرض</option>
                    <option value="half">نصف العرض</option>
                    <option value="third">ربع العرض</option>
                  </select>
                </div>
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
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
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
