'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const FIELD_TYPES = ['text', 'textarea', 'number', 'select', 'radio', 'checkbox']

interface FormField {
  id: string; label: string; type: string; required: boolean; options?: string[]; placeholder?: string
}

export default function ProductTypesPage() {
  const [types, setTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [fields, setFields] = useState<FormField[]>([])

  useEffect(() => {
    fetchTypes()
  }, [])

  async function fetchTypes() {
    const { data } = await supabase.from('product_types').select('*').order('created_at')
    setTypes(data || [])
    setLoading(false)
  }

  function openModal(type?: any) {
    if (type) {
      setEditingId(type.id)
      setName(type.name)
      setFields(type.form_schema?.fields || [])
    } else {
      setEditingId(null)
      setName('')
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
    if (!name.trim()) { toast.error('Name required'); return }
    setSaving(true)
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const formSchema = { fields }
      if (editingId) {
        const { error } = await supabase.from('product_types').update({ name, slug, form_schema: formSchema }).eq('id', editingId)
        if (error) throw error
        toast.success('Updated')
      } else {
        const { error } = await supabase.from('product_types').insert({ name, slug, form_schema: formSchema })
        if (error) throw error
        toast.success('Created')
      }
      setShowModal(false)
      fetchTypes()
    } catch (error: any) {
      toast.error(error.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function deleteType(id: string) {
    if (!confirm('Delete this product type?')) return
    try {
      const { error } = await supabase.from('product_types').delete().eq('id', id)
      if (error) throw error
      setTypes(types.filter(t => t.id !== id))
      toast.success('Deleted')
    } catch (error) {
      toast.error('Delete failed')
    }
  }

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-lg h-16" />)}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Types</h1>
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add Type
        </button>
      </div>

      {types.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">No product types yet</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Fields</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {types.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{type.name}</td>
                  <td className="px-4 py-3 text-gray-500">{type.form_schema?.fields?.length || 0} fields</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openModal(type)} className="text-blue-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => deleteType(type.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">{editingId ? 'Edit Product Type' : 'New Product Type'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Clothing" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Form Fields</label>
                  <button type="button" onClick={addField} className="text-sm text-blue-600 hover:underline">+ Add Field</button>
                </div>
                {fields.length === 0 ? (
                  <p className="text-sm text-gray-500 border-2 border-dashed rounded-lg p-4 text-center">No fields yet</p>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, i) => (
                      <div key={field.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Label"
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
                            placeholder="Options (comma-separated)"
                            value={field.options?.join(', ') || ''}
                            onChange={e => updateField(i, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            className="w-full px-2 py-1.5 border rounded text-sm mb-2"
                          />
                        )}
                        <div className="flex justify-between items-center">
                          <label className="flex items-center gap-1 text-sm">
                            <input type="checkbox" checked={field.required} onChange={e => updateField(i, { required: e.target.checked })} className="rounded" />
                            Required
                          </label>
                          <button type="button" onClick={() => removeField(i)} className="text-red-600 text-sm">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
