'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Trash2, GripVertical, Eye, EyeOff, Edit2, ChevronDown, ChevronUp, X, Save } from 'lucide-react'

interface LandingSection {
  id: string
  title: string
  subtitle: string | null
  side_image: string | null
  top_image: string | null
  background_color: string
  display_order: number
  max_products: number
  is_active: boolean
  product_source: 'latest' | 'category' | 'manual'
  category_id: string | null
  category?: { id: string; name: string } | null
}

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  image: string | null
  price: number
}

const BACKGROUND_OPTIONS = [
  { value: 'bg-white', label: 'Blanc', color: '#ffffff' },
  { value: 'bg-gray-50', label: 'Gris clair', color: '#f9fafb' },
  { value: 'bg-gray-100', label: 'Gris', color: '#f3f4f6' },
  { value: 'bg-primary-50', label: 'Primaire clair', color: '#e6eaf2' },
]

export default function SectionsAdminPage() {
  const [sections, setSections] = useState<LandingSection[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSection, setEditingSection] = useState<LandingSection | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSection, setNewSection] = useState<Partial<LandingSection>>({
    title: '',
    subtitle: '',
    side_image: '',
    top_image: '',
    background_color: 'bg-white',
    max_products: 8,
    is_active: true,
    product_source: 'latest',
    category_id: null
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('landing_sections')
        .select('*, category:product_types(id, name)')
        .order('display_order', { ascending: true })

      if (sectionsError) throw sectionsError
      setSections(sectionsData || [])

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('product_types')
        .select('id, name')
        .order('name')

      setCategories(categoriesData || [])

      // Fetch products for manual selection
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, image, price')
        .eq('is_active', true)
        .order('name')

      setProducts(productsData || [])
    } catch (error: any) {
      console.error('Error fetching data:', error)
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  async function addSection() {
    if (!newSection.title?.trim()) {
      toast.error('Le titre est requis')
      return
    }

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('landing_sections')
        .insert({
          title: newSection.title,
          subtitle: newSection.subtitle || null,
          side_image: newSection.side_image || null,
          top_image: newSection.top_image || null,
          background_color: newSection.background_color || 'bg-white',
          max_products: newSection.max_products || 8,
          is_active: newSection.is_active ?? true,
          product_source: newSection.product_source || 'latest',
          category_id: newSection.category_id || null,
          display_order: sections.length
        })
        .select('*, category:product_types(id, name)')
        .single()

      if (error) throw error

      setSections([...sections, data])
      setNewSection({
        title: '',
        subtitle: '',
        side_image: '',
        top_image: '',
        background_color: 'bg-white',
        max_products: 8,
        is_active: true,
        product_source: 'latest',
        category_id: null
      })
      setShowAddForm(false)
      toast.success('Section ajoutée')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout')
    } finally {
      setSaving(false)
    }
  }

  async function updateSection(section: LandingSection) {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('landing_sections')
        .update({
          title: section.title,
          subtitle: section.subtitle,
          side_image: section.side_image,
          top_image: section.top_image,
          background_color: section.background_color,
          max_products: section.max_products,
          is_active: section.is_active,
          product_source: section.product_source,
          category_id: section.category_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', section.id)

      if (error) throw error

      setSections(sections.map(s => s.id === section.id ? section : s))
      setEditingSection(null)
      toast.success('Section mise à jour')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  async function deleteSection(id: string) {
    if (!confirm('Supprimer cette section ?')) return

    try {
      const { error } = await supabase
        .from('landing_sections')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSections(sections.filter(s => s.id !== id))
      toast.success('Section supprimée')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  }

  async function toggleActive(section: LandingSection) {
    try {
      const { error } = await supabase
        .from('landing_sections')
        .update({ is_active: !section.is_active })
        .eq('id', section.id)

      if (error) throw error

      setSections(sections.map(s => 
        s.id === section.id ? { ...s, is_active: !s.is_active } : s
      ))
      toast.success(section.is_active ? 'Section désactivée' : 'Section activée')
    } catch (error: any) {
      toast.error(error.message || 'Erreur')
    }
  }

  async function moveSection(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.length) return

    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[newIndex]
    newSections[newIndex] = temp

    // Update display_order for both sections
    try {
      await Promise.all([
        supabase.from('landing_sections').update({ display_order: index }).eq('id', newSections[index].id),
        supabase.from('landing_sections').update({ display_order: newIndex }).eq('id', newSections[newIndex].id)
      ])

      setSections(newSections.map((s, i) => ({ ...s, display_order: i })))
    } catch (error) {
      toast.error('Erreur lors du déplacement')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sections de la Page d'Accueil</h1>
          <p className="text-gray-500 text-sm">Gérez les sections de produits affichées sur la page d'accueil</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" />
          Nouvelle Section
        </button>
      </div>

      {/* Add New Section Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Nouvelle Section</h2>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titre *</label>
              <input
                type="text"
                value={newSection.title || ''}
                onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Ex: Offres Spéciales"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sous-titre</label>
              <input
                type="text"
                value={newSection.subtitle || ''}
                onChange={(e) => setNewSection({ ...newSection, subtitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Ex: À ne pas rater"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image latérale (URL)</label>
              <input
                type="url"
                value={newSection.side_image || ''}
                onChange={(e) => setNewSection({ ...newSection, side_image: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image mobile (URL)</label>
              <input
                type="url"
                value={newSection.top_image || ''}
                onChange={(e) => setNewSection({ ...newSection, top_image: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Couleur de fond</label>
              <select
                value={newSection.background_color || 'bg-white'}
                onChange={(e) => setNewSection({ ...newSection, background_color: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {BACKGROUND_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre de produits</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newSection.max_products || 8}
                onChange={(e) => setNewSection({ ...newSection, max_products: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Source des produits</label>
              <select
                value={newSection.product_source || 'latest'}
                onChange={(e) => setNewSection({ ...newSection, product_source: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="latest">Derniers produits</option>
                <option value="category">Par catégorie</option>
              </select>
            </div>

            {newSection.product_source === 'category' && (
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie</label>
                <select
                  value={newSection.category_id || ''}
                  onChange={(e) => setNewSection({ ...newSection, category_id: e.target.value || null })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Sélectionner...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={addSection}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Enregistrement...' : 'Ajouter'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-3">
        {sections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Aucune section créée</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-primary-600 hover:underline"
            >
              Créer votre première section
            </button>
          </div>
        ) : (
          sections.map((section, index) => (
            <div
              key={section.id}
              className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${
                section.is_active ? 'border-primary-600' : 'border-gray-300'
              }`}
            >
              {editingSection?.id === section.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Titre</label>
                      <input
                        type="text"
                        value={editingSection.title}
                        onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Sous-titre</label>
                      <input
                        type="text"
                        value={editingSection.subtitle || ''}
                        onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Image latérale (URL)</label>
                      <input
                        type="url"
                        value={editingSection.side_image || ''}
                        onChange={(e) => setEditingSection({ ...editingSection, side_image: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Image mobile (URL)</label>
                      <input
                        type="url"
                        value={editingSection.top_image || ''}
                        onChange={(e) => setEditingSection({ ...editingSection, top_image: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Couleur de fond</label>
                      <select
                        value={editingSection.background_color}
                        onChange={(e) => setEditingSection({ ...editingSection, background_color: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        {BACKGROUND_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre de produits</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={editingSection.max_products}
                        onChange={(e) => setEditingSection({ ...editingSection, max_products: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Source des produits</label>
                      <select
                        value={editingSection.product_source}
                        onChange={(e) => setEditingSection({ ...editingSection, product_source: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="latest">Derniers produits</option>
                        <option value="category">Par catégorie</option>
                      </select>
                    </div>

                    {editingSection.product_source === 'category' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Catégorie</label>
                        <select
                          value={editingSection.category_id || ''}
                          onChange={(e) => setEditingSection({ ...editingSection, category_id: e.target.value || null })}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">Sélectionner...</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => updateSection(editingSection)}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Enregistrement...' : 'Sauvegarder'}
                    </button>
                    <button
                      onClick={() => setEditingSection(null)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center gap-4">
                  {/* Drag Handle & Order */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <button
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Preview Image */}
                  {section.side_image && (
                    <img
                      src={section.side_image}
                      alt=""
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}

                  {/* Section Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{section.title}</h3>
                    {section.subtitle && (
                      <p className="text-sm text-gray-500 truncate">{section.subtitle}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>
                        {section.product_source === 'latest' ? 'Derniers produits' : 
                         section.product_source === 'category' ? `Catégorie: ${section.category?.name || 'Non définie'}` : 
                         'Sélection manuelle'}
                      </span>
                      <span>•</span>
                      <span>{section.max_products} produits max</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(section)}
                      className={`p-2 rounded-lg transition ${
                        section.is_active 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={section.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {section.is_active ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>

                    <button
                      onClick={() => setEditingSection(section)}
                      className="p-2 text-primary-600 hover:bg-blue-50 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => deleteSection(section.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <strong>💡 Conseil:</strong> Les sections sont affichées dans l'ordre défini ci-dessus. 
        Utilisez les flèches pour réorganiser. Les sections désactivées ne seront pas visibles sur la page d'accueil.
      </div>
    </div>
  )
}
