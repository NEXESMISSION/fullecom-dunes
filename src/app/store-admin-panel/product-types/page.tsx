'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const FIELD_TYPES = ['text', 'textarea', 'number', 'select', 'radio', 'checkbox']

interface FormField {
  id: string; label: string; type: string; required: boolean; options?: string[]; placeholder?: string
}

interface ProductType {
  id: string
  name: string
  slug: string
  image: string | null
  parent_id: string | null
  form_schema: { fields: FormField[] } | null
  created_at: string
}

export default function ProductTypesPage() {
  const [types, setTypes] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [parentId, setParentId] = useState<string | null>(null)
  const [fields, setFields] = useState<FormField[]>([])

  useEffect(() => {
    fetchTypes()
  }, [])

  async function fetchTypes() {
    const { data } = await supabase.from('product_types').select('*').order('name')
    setTypes(data || [])
    setLoading(false)
  }

  // Build tree structure for display
  function buildTree(items: ProductType[], parentId: string | null = null): ProductType[] {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id)
      }))
  }

  // Get parent categories (those without parent_id)
  const parentCategories = types.filter(t => !t.parent_id)

  function openModal(type?: ProductType) {
    if (type) {
      setEditingId(type.id)
      setName(type.name)
      setImage(type.image || '')
      setParentId(type.parent_id)
      setFields(type.form_schema?.fields || [])
    } else {
      setEditingId(null)
      setName('')
      setImage('')
      setParentId(null)
      setFields([])
    }
    setShowModal(true)
  }

  function addField() {
    setFields([...fields, { id: `field_${Date.now()}`, label: '', type: 'text', required: false, options: [] }])
  }

  function updateField(index: number, updates: Partial<FormField>) {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Nom requis'); return }
    setSaving(true)
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const formSchema = { fields }
      const data = { 
        name, 
        slug, 
        image: image || null, 
        parent_id: parentId || null,
        form_schema: formSchema 
      }
      if (editingId) {
        const { error } = await supabase.from('product_types').update(data).eq('id', editingId)
        if (error) throw error
        toast.success('Mis à jour')
      } else {
        const { error } = await supabase.from('product_types').insert(data)
        if (error) throw error
        toast.success('Créé')
      }
      setShowModal(false)
      fetchTypes()
    } catch (error: any) {
      toast.error(error.message || 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  async function deleteType(id: string) {
    if (!confirm('Supprimer ce type ?')) return
    try {
      const { error } = await supabase.from('product_types').delete().eq('id', id)
      if (error) throw error
      setTypes(types.filter(t => t.id !== id))
      toast.success('Supprimé')
    } catch (error) {
      toast.error('Erreur')
    }
  }

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-lg h-16" />)}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Types de produits</h1>
        <button onClick={() => openModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          + Ajouter
        </button>
      </div>

      {types.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">Aucun type</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Image</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Parent</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Champs</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {types.map((type) => {
                const parentType = type.parent_id ? types.find(t => t.id === type.parent_id) : null
                return (
                  <tr key={type.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {type.image ? (
                        <img src={type.image} alt={type.name} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">-</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {type.parent_id && <span className="text-gray-400 mr-2">└</span>}
                      {type.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {parentType ? (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{parentType.name}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{type.form_schema?.fields?.length || 0} champ(s)</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openModal(type)} className="text-primary-600 hover:underline mr-3">Modifier</button>
                      <button onClick={() => deleteType(type.id)} className="text-red-600 hover:underline">Supprimer</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">{editingId ? 'Modifier' : 'Nouveau type'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Vêtements" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Catégorie parente (optionnel)</label>
                <select 
                  value={parentId || ''} 
                  onChange={e => setParentId(e.target.value || null)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">-- Aucune (catégorie principale) --</option>
                  {types.filter(t => t.id !== editingId && !t.parent_id).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Sélectionnez une catégorie parente pour créer une sous-catégorie</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL image</label>
                <input type="url" value={image} onChange={e => setImage(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." dir="ltr" />
                {image && (
                  <img src={image} alt="Aperçu" className="mt-2 w-20 h-20 object-cover rounded border" />
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Champs du formulaire</label>
                  <button type="button" onClick={addField} className="text-sm text-primary-600 hover:underline">+ Ajouter</button>
                </div>
                {fields.length === 0 ? (
                  <p className="text-sm text-gray-500 border-2 border-dashed rounded-lg p-4 text-center">Aucun champ</p>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, i) => (
                      <div key={field.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Libellé"
                            value={field.label}
                            onChange={e => updateField(i, { label: e.target.value })}
                            className="px-2 py-1.5 border rounded text-sm"
                          />
                          <select
                            value={field.type}
                            onChange={e => updateField(i, { type: e.target.value })}
                            className="px-2 py-1.5 border rounded text-sm"
                          >
                            {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                        {['select', 'radio', 'checkbox'].includes(field.type) && (
                          <input
                            type="text"
                            placeholder="Options (séparées par virgules)"
                            value={field.options?.join(', ') || ''}
                            onChange={e => updateField(i, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            className="w-full px-2 py-1.5 border rounded text-sm mb-2"
                          />
                        )}
                        <div className="flex justify-between items-center">
                          <label className="flex items-center gap-1 text-sm">
                            <input type="checkbox" checked={field.required} onChange={e => updateField(i, { required: e.target.checked })} className="rounded" />
                            Requis
                          </label>
                          <button type="button" onClick={() => removeField(i)} className="text-red-600 text-sm">Suppr.</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
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
