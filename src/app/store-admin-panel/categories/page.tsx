'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Trash2, ChevronDown, ChevronLeft, Edit2, X, Save } from 'lucide-react'

interface Category {
  id: string
  name: string
  image?: string
  parent_id: string | null
  children?: Category[]
  level?: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [allCategoriesFlat, setAllCategoriesFlat] = useState<Category[]>([])
  
  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    parent_id: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('product_types')
        .select('*')
        .order('name')

      if (error) throw error

      // Build recursive tree structure
      const allCategories = data || []
      
      const buildTree = (parentId: string | null, level: number): Category[] => {
        return allCategories
          .filter(c => c.parent_id === parentId)
          .map(c => ({
            ...c,
            level,
            children: buildTree(c.id, level + 1)
          }))
      }

      const tree = buildTree(null, 0)
      setCategories(tree)
      
      // Store flat list for dropdown
      setAllCategoriesFlat(allCategories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      toast.error('Nom requis')
      return
    }

    setSaving(true)
    try {
      const categoryData = {
        name: formData.name.trim(),
        image: formData.image || null,
        parent_id: formData.parent_id || null
      }

      if (editingId) {
        const { error } = await supabase
          .from('product_types')
          .update(categoryData)
          .eq('id', editingId)

        if (error) throw error
        toast.success('Catégorie mise à jour')
      } else {
        const { error } = await supabase
          .from('product_types')
          .insert(categoryData)

        if (error) throw error
        toast.success('Catégorie ajoutée')
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ name: '', image: '', parent_id: '' })
      fetchCategories()
    } catch (error) {
      console.error('Failed to save category:', error)
      toast.error('Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette catégorie et ses sous-catégories ?')) return

    try {
      // Delete children first
      await supabase.from('product_types').delete().eq('parent_id', id)
      
      // Then delete the category
      const { error } = await supabase.from('product_types').delete().eq('id', id)
      if (error) throw error

      toast.success('Catégorie supprimée')
      fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast.error('Erreur de suppression')
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      image: category.image || '',
      parent_id: category.parent_id || ''
    })
    setShowForm(true)
  }

  function toggleExpand(id: string) {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Get all categories for dropdown (can select any as parent)
  const getIndentedOptions = (cats: Category[], level = 0): { id: string; name: string; level: number }[] => {
    let options: { id: string; name: string; level: number }[] = []
    cats.forEach(cat => {
      options.push({ id: cat.id, name: cat.name, level })
      if (cat.children && cat.children.length > 0) {
        options = [...options, ...getIndentedOptions(cat.children, level + 1)]
      }
    })
    return options
  }
  const categoryOptions = getIndentedOptions(categories)

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-white rounded-lg h-16" />
        <div className="bg-white rounded-lg h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Catégories</h1>
          <p className="text-gray-500 text-sm">Gérer les catégories de produits</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            setFormData({ name: '', image: '', parent_id: '' })
          }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" />
          إضافة فئة
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Modifier' : 'Nouvelle catégorie'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Ex: Vêtements homme"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Catégorie parente</label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">-- Catégorie principale --</option>
                {categoryOptions.map(cat => (
                  <option key={cat.id} value={cat.id} disabled={cat.id === editingId}>
                    {'\u00A0\u00A0'.repeat(cat.level)}{cat.level > 0 ? '└ ' : ''}{cat.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Laisser vide pour une catégorie principale</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">URL image</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://example.com/image.jpg"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucune catégorie. Ajoutez-en une pour commencer.
          </div>
        ) : (
          <div className="divide-y">
            {categories.map((category) => (
              <div key={category.id}>
                {/* Parent Category */}
                <div className="flex items-center gap-3 p-4 hover:bg-gray-50">
                  {category.children && category.children.length > 0 ? (
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronLeft className="h-5 w-5" />
                      )}
                    </button>
                  ) : (
                    <div className="w-7" />
                  )}

                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  )}

                  <div className="flex-1">
                    <p className="font-medium">{category.name}</p>
                    {category.children && category.children.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {category.children.length} sous-catégorie(s)
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setFormData({ name: '', image: '', parent_id: category.id })
                        setEditingId(null)
                        setShowForm(true)
                      }}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg text-sm"
                      title="Ajouter sous-catégorie"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => startEdit(category)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-400 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {expandedCategories.has(category.id) && category.children && (
                  <div className="bg-gray-50 border-t">
                    {category.children.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-3 p-4 pr-14 hover:bg-gray-100"
                      >
                        {sub.image && (
                          <img
                            src={sub.image}
                            alt={sub.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        )}

                        <div className="flex-1">
                          <p className="text-sm">{sub.name}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(sub)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="p-2 text-red-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
