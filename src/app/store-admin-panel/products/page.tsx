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
    name: '', description: '', price: '', original_price: '', stock: '',
    image: '', images: [] as string[], product_type_id: '', is_active: true
  })
  const [newImageUrl, setNewImageUrl] = useState('')

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
        price: product.price.toString(), original_price: product.original_price?.toString() || '',
        stock: product.stock.toString(),
        image: product.image || '',
        images: product.images || [],
        product_type_id: product.product_type_id || '', is_active: product.is_active !== false
      })
      setNewImageUrl('')
    } else {
      setEditingId(null)
      setForm({ name: '', description: '', price: '', original_price: '', stock: '', image: '', images: [], product_type_id: '', is_active: true })
      setNewImageUrl('')
    }
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        name: form.name, description: form.description,
        price: parseFloat(form.price), 
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parseInt(form.stock),
        image: form.image || (form.images.length > 0 ? form.images[0] : ''),
        images: form.images,
        product_type_id: form.product_type_id || null, is_active: form.is_active
      }
      if (editingId) {
        const { error } = await supabase.from('products').update(data).eq('id', editingId)
        if (error) throw error
        toast.success('Produit mis à jour')
      } else {
        const { error } = await supabase.from('products').insert(data)
        if (error) throw error
        toast.success('Produit créé')
      }
      setShowModal(false)
      fetchProducts()
    } catch (error: any) {
      toast.error(error.message || 'Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      setProducts(products.filter(p => p.id !== id))
      toast.success('Supprimé')
    } catch (error) {
      toast.error('Erreur de suppression')
    }
  }

  if (loading) return <div className="animate-pulse grid grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-lg h-48" />)}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Produits</h1>
        <button onClick={() => openModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          + Nouveau produit
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white p-8 text-center text-gray-500">Aucun produit</div>
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
                <p className="text-xs text-gray-500">{p.product_type?.name || 'Sans catégorie'}</p>
                <h3 className="font-medium truncate">{p.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-primary-600">{p.price.toFixed(2)} DT</span>
                  <span className={`text-xs ${p.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {p.stock > 0 ? `${p.stock} en stock` : 'Épuisé'}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openModal(p)} className="flex-1 py-1.5 border text-sm hover:bg-gray-50">Modifier</button>
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
              <h2 className="font-semibold">{editingId ? 'Modifier' : 'Nouveau produit'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Prix *</label>
                  <input type="number" step="0.01" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ancien prix</label>
                  <input type="number" step="0.01" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Prix barré" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock *</label>
                <input type="number" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie *</label>
                <select required value={form.product_type_id} onChange={e => setForm({...form, product_type_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Choisir...</option>
                  {productTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              {/* Images Section */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">Images du produit</label>
                  <span className="text-xs text-gray-500">{form.images.length + (form.image ? 1 : 0)} image(s)</span>
                </div>

                {/* Image principale */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Image principale *</label>
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      value={form.image} 
                      onChange={e => setForm({...form, image: e.target.value})} 
                      className="flex-1 px-3 py-2 border rounded-lg text-sm" 
                      placeholder="https://exemple.com/image.jpg" 
                    />
                    {form.image && (
                      <img src={form.image} alt="Principale" className="w-10 h-10 object-cover rounded border" />
                    )}
                  </div>
                </div>

                {/* Images supplémentaires */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Images supplémentaires</label>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="url" 
                      value={newImageUrl} 
                      onChange={e => setNewImageUrl(e.target.value)} 
                      className="flex-1 px-3 py-2 border rounded-lg text-sm" 
                      placeholder="https://exemple.com/image2.jpg"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (newImageUrl.trim()) {
                            setForm({...form, images: [...form.images, newImageUrl.trim()]})
                            setNewImageUrl('')
                          }
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (newImageUrl.trim()) {
                          setForm({...form, images: [...form.images, newImageUrl.trim()]})
                          setNewImageUrl('')
                        }
                      }}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  
                  {/* Grid des images */}
                  {form.images.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative group aspect-square bg-white rounded-lg border overflow-hidden">
                          <img src={img} alt={`Image ${i+1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                // Move to main image
                                const oldMain = form.image
                                setForm({
                                  ...form, 
                                  image: img, 
                                  images: form.images.filter((_, idx) => idx !== i).concat(oldMain ? [oldMain] : [])
                                })
                              }}
                              className="p-1.5 bg-white rounded text-xs hover:bg-gray-100"
                              title="Définir comme principale"
                            >
                              ⭐
                            </button>
                            <button
                              type="button"
                              onClick={() => setForm({...form, images: form.images.filter((_, idx) => idx !== i)})}
                              className="p-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                              title="Supprimer"
                            >
                              ✕
                            </button>
                          </div>
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">{i+1}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4 border-2 border-dashed rounded-lg">
                      Ajoutez des images supplémentaires pour la galerie
                    </p>
                  )}
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="rounded" />
                <span className="text-sm">Actif (visible)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
