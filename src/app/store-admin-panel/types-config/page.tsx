'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// E-commerce optimized field types
const FIELD_TYPES = [
  { value: 'text', label: 'Texte', icon: '📝', desc: 'Champ texte simple' },
  { value: 'textarea', label: 'Texte long', icon: '📄', desc: 'Zone de texte multiligne' },
  { value: 'number', label: 'Nombre', icon: '🔢', desc: 'Valeur numérique' },
  { value: 'select', label: 'Liste déroulante', icon: '📋', desc: 'Choisir une option' },
  { value: 'radio', label: 'Choix unique', icon: '⭕', desc: 'Boutons radio' },
  { value: 'checkbox', label: 'Cases à cocher', icon: '☑️', desc: 'Plusieurs choix' },
  { value: 'color', label: 'Couleur', icon: '🎨', desc: 'Sélecteur de couleur' },
  { value: 'size', label: 'Taille', icon: '📏', desc: 'Tailles vêtements/chaussures' },
  { value: 'date', label: 'Date', icon: '📅', desc: 'Sélecteur de date' },
  { value: 'email', label: 'Email', icon: '✉️', desc: 'Adresse email' },
  { value: 'phone', label: 'Téléphone', icon: '📞', desc: 'Numéro de téléphone' },
  { value: 'image', label: 'Image URL', icon: '🖼️', desc: 'Lien vers une image' },
]

// Preset color palette for e-commerce
const COLOR_PRESETS = [
  { name: 'Noir', hex: '#000000' },
  { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Gris', hex: '#6B7280' },
  { name: 'Rouge', hex: '#EF4444' },
  { name: 'Bleu', hex: '#3B82F6' },
  { name: 'Vert', hex: '#22C55E' },
  { name: 'Jaune', hex: '#EAB308' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Rose', hex: '#EC4899' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Marron', hex: '#92400E' },
  { name: 'Beige', hex: '#D4B896' },
  { name: 'Marine', hex: '#1E3A5F' },
  { name: 'Bordeaux', hex: '#722F37' },
  { name: 'Or', hex: '#FFD700' },
  { name: 'Argent', hex: '#C0C0C0' },
]

// Size presets
const SIZE_PRESETS = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  shoes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  kids: ['2-3 ans', '4-5 ans', '6-7 ans', '8-9 ans', '10-11 ans', '12-13 ans'],
  numbers: ['34', '36', '38', '40', '42', '44', '46', '48', '50'],
}

interface ColorOption {
  name: string
  hex: string
}

interface FormField {
  id: string
  label: string
  type: string
  required: boolean
  options?: string[]
  colorOptions?: ColorOption[]
  placeholder?: string
}

interface ProductType {
  id: string
  name: string
  form_schema: { fields: FormField[] } | null
}

export default function TypesConfigPage() {
  const [types, setTypes] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<ProductType | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [saving, setSaving] = useState(false)
  const [newOptionInputs, setNewOptionInputs] = useState<{[key: number]: string}>({})
  const [customColorName, setCustomColorName] = useState<{[key: number]: string}>({})
  const [customColorHex, setCustomColorHex] = useState<{[key: number]: string}>({})

  useEffect(() => {
    fetchTypes()
  }, [])

  async function fetchTypes() {
    const { data } = await supabase
      .from('product_types')
      .select('id, name, form_schema')
      .order('name')
    setTypes(data || [])
    setLoading(false)
  }

  function selectType(type: ProductType) {
    setSelectedType(type)
    setFields(type.form_schema?.fields || [])
  }

  function addField() {
    setFields([...fields, { 
      id: `field_${Date.now()}`, 
      label: '', 
      type: 'text', 
      required: false, 
      options: [],
      placeholder: ''
    }])
  }

  function updateField(index: number, updates: Partial<FormField>) {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index))
  }

  function moveField(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === fields.length - 1) return
    
    const newFields = [...fields]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]]
    setFields(newFields)
  }

  async function handleSave() {
    if (!selectedType) return
    setSaving(true)
    
    try {
      const { error } = await supabase
        .from('product_types')
        .update({ form_schema: { fields } })
        .eq('id', selectedType.id)
      
      if (error) throw error
      
      // Update local state
      setTypes(types.map(t => 
        t.id === selectedType.id 
          ? { ...t, form_schema: { fields } }
          : t
      ))
      setSelectedType({ ...selectedType, form_schema: { fields } })
      
      toast.success('Champs sauvegardés!')
    } catch (error: any) {
      toast.error(error.message || 'Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1,2,3].map(i => <div key={i} className="bg-white rounded-lg h-16" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Types de Produit - Champs Personnalisés</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ajoutez des champs personnalisés pour chaque type de produit. Ces champs apparaîtront lors de la commande.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Types List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-700">Sélectionner un type</h2>
            </div>
            <div className="divide-y max-h-[60vh] overflow-y-auto">
              {types.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Aucun type de produit.
                  <br />
                  <span className="text-sm">Créez d'abord des catégories.</span>
                </div>
              ) : (
                types.map((type) => {
                  const fieldCount = type.form_schema?.fields?.length || 0
                  return (
                    <button
                      key={type.id}
                      onClick={() => selectType(type)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center justify-between ${
                        selectedType?.id === type.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                      }`}
                    >
                      <span className={selectedType?.id === type.id ? 'font-medium text-primary-700' : ''}>
                        {type.name}
                      </span>
                      {fieldCount > 0 && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                          {fieldCount} champ{fieldCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Fields Editor */}
        <div className="lg:col-span-2">
          {selectedType ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-primary-50 to-white flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg text-gray-900">{selectedType.name}</h2>
                  <p className="text-sm text-gray-500">Configurez les champs personnalisés</p>
                </div>
                <button
                  onClick={addField}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm font-medium"
                >
                  + Ajouter un champ
                </button>
              </div>

              <div className="p-4">
                {fields.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="text-gray-500">Aucun champ personnalisé</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Cliquez sur "+ Ajouter un champ" pour commencer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, i) => (
                      <div key={field.id} className="border rounded-xl p-4 bg-gray-50">
                        <div className="flex items-start gap-3">
                          {/* Reorder buttons */}
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveField(i, 'up')}
                              disabled={i === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => moveField(i, 'down')}
                              disabled={i === fields.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            >
                              ▼
                            </button>
                          </div>

                          <div className="flex-1 space-y-3">
                            {/* Field label & type */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Libellé du champ *
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ex: Taille, Couleur, Gravure..."
                                  value={field.label}
                                  onChange={e => updateField(i, { label: e.target.value })}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Type de champ
                                </label>
                                <select
                                  value={field.type}
                                  onChange={e => updateField(i, { type: e.target.value })}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                >
                                  {FIELD_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Placeholder */}
                            {['text', 'textarea', 'number'].includes(field.type) && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Placeholder (optionnel)
                                </label>
                                <input
                                  type="text"
                                  placeholder="Texte d'aide..."
                                  value={field.placeholder || ''}
                                  onChange={e => updateField(i, { placeholder: e.target.value })}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                              </div>
                            )}

                            {/* COLOR PICKER with hex codes */}
                            {field.type === 'color' && (
                              <div className="space-y-3">
                                <label className="block text-xs font-medium text-gray-600">Couleurs disponibles</label>
                                
                                {/* Preset colors - click to add */}
                                <div>
                                  <p className="text-xs text-gray-500 mb-2">Cliquez pour ajouter :</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {COLOR_PRESETS.map((color) => {
                                      const isAdded = field.colorOptions?.some(c => c.hex === color.hex)
                                      return (
                                        <button
                                          key={color.hex}
                                          type="button"
                                          onClick={() => {
                                            if (!isAdded) {
                                              updateField(i, { 
                                                colorOptions: [...(field.colorOptions || []), color] 
                                              })
                                            }
                                          }}
                                          disabled={isAdded}
                                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border transition ${
                                            isAdded ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-md hover:scale-105'
                                          }`}
                                          title={`${color.name} (${color.hex})`}
                                        >
                                          <span 
                                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm" 
                                            style={{ backgroundColor: color.hex }}
                                          />
                                          <span className="text-gray-600">{color.name}</span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>

                                {/* Custom color input */}
                                <div className="flex gap-2 items-end bg-gray-100 p-3 rounded-lg">
                                  <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">Couleur personnalisée</label>
                                    <input
                                      type="text"
                                      placeholder="Nom (ex: Turquoise)"
                                      value={customColorName[i] || ''}
                                      onChange={e => setCustomColorName({...customColorName, [i]: e.target.value})}
                                      className="w-full px-3 py-2 border rounded-lg text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Code couleur</label>
                                    <div className="flex gap-1">
                                      <input
                                        type="color"
                                        value={customColorHex[i] || '#000000'}
                                        onChange={e => setCustomColorHex({...customColorHex, [i]: e.target.value})}
                                        className="w-10 h-10 rounded cursor-pointer border-0"
                                      />
                                      <input
                                        type="text"
                                        value={customColorHex[i] || '#000000'}
                                        onChange={e => setCustomColorHex({...customColorHex, [i]: e.target.value})}
                                        className="w-24 px-2 py-2 border rounded-lg text-sm font-mono"
                                        placeholder="#000000"
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const name = customColorName[i]?.trim()
                                      const hex = customColorHex[i] || '#000000'
                                      if (name) {
                                        updateField(i, { 
                                          colorOptions: [...(field.colorOptions || []), { name, hex }] 
                                        })
                                        setCustomColorName({...customColorName, [i]: ''})
                                        setCustomColorHex({...customColorHex, [i]: '#000000'})
                                      }
                                    }}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 h-10"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Selected colors */}
                                {field.colorOptions && field.colorOptions.length > 0 ? (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-2">Couleurs sélectionnées :</p>
                                    <div className="flex flex-wrap gap-2">
                                      {field.colorOptions.map((color, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border shadow-sm">
                                          <span 
                                            className="w-6 h-6 rounded-full border-2 border-gray-200" 
                                            style={{ backgroundColor: color.hex }}
                                          />
                                          <div>
                                            <p className="text-sm font-medium">{color.name}</p>
                                            <p className="text-xs text-gray-400 font-mono">{color.hex}</p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => updateField(i, { 
                                              colorOptions: field.colorOptions?.filter((_, cIdx) => cIdx !== idx) 
                                            })}
                                            className="text-gray-400 hover:text-red-500 ml-1"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 text-center py-3 border-2 border-dashed rounded-lg">
                                    Aucune couleur sélectionnée
                                  </p>
                                )}
                              </div>
                            )}

                            {/* SIZE PICKER with presets */}
                            {field.type === 'size' && (
                              <div className="space-y-3">
                                <label className="block text-xs font-medium text-gray-600">Tailles disponibles</label>
                                
                                {/* Size presets */}
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(SIZE_PRESETS).map(([key, sizes]) => (
                                    <button
                                      key={key}
                                      type="button"
                                      onClick={() => updateField(i, { options: sizes })}
                                      className="text-left p-2 border rounded-lg hover:bg-gray-50 transition"
                                    >
                                      <p className="text-xs font-medium text-gray-700 capitalize">
                                        {key === 'clothing' ? '👕 Vêtements' : 
                                         key === 'shoes' ? '👟 Chaussures' : 
                                         key === 'kids' ? '👶 Enfants' : '📐 Numérique'}
                                      </p>
                                      <p className="text-xs text-gray-400 truncate">{sizes.join(', ')}</p>
                                    </button>
                                  ))}
                                </div>

                                {/* Custom size input */}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Ajouter une taille..."
                                    value={newOptionInputs[i] || ''}
                                    onChange={e => setNewOptionInputs({...newOptionInputs, [i]: e.target.value})}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault()
                                        const val = newOptionInputs[i]?.trim()
                                        if (val && !field.options?.includes(val)) {
                                          updateField(i, { options: [...(field.options || []), val] })
                                          setNewOptionInputs({...newOptionInputs, [i]: ''})
                                        }
                                      }
                                    }}
                                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const val = newOptionInputs[i]?.trim()
                                      if (val && !field.options?.includes(val)) {
                                        updateField(i, { options: [...(field.options || []), val] })
                                        setNewOptionInputs({...newOptionInputs, [i]: ''})
                                      }
                                    }}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Selected sizes */}
                                {field.options && field.options.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {field.options.map((size, idx) => (
                                      <div key={idx} className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-lg">
                                        <span className="text-sm font-medium text-primary-700">{size}</span>
                                        <button
                                          type="button"
                                          onClick={() => updateField(i, { 
                                            options: field.options?.filter((_, sIdx) => sIdx !== idx) 
                                          })}
                                          className="text-primary-400 hover:text-red-500 text-xs ml-1"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 text-center py-3 border-2 border-dashed rounded-lg">
                                    Aucune taille. Cliquez sur un preset ou ajoutez manuellement.
                                  </p>
                                )}
                              </div>
                            )}

                            {/* OPTIONS for select/radio/checkbox */}
                            {['select', 'radio', 'checkbox'].includes(field.type) && (
                              <div className="space-y-3">
                                <label className="block text-xs font-medium text-gray-600">Options disponibles</label>
                                
                                {/* Add option */}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Nouvelle option..."
                                    value={newOptionInputs[i] || ''}
                                    onChange={e => setNewOptionInputs({...newOptionInputs, [i]: e.target.value})}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault()
                                        const val = newOptionInputs[i]?.trim()
                                        if (val && !field.options?.includes(val)) {
                                          updateField(i, { options: [...(field.options || []), val] })
                                          setNewOptionInputs({...newOptionInputs, [i]: ''})
                                        }
                                      }
                                    }}
                                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const val = newOptionInputs[i]?.trim()
                                      if (val && !field.options?.includes(val)) {
                                        updateField(i, { options: [...(field.options || []), val] })
                                        setNewOptionInputs({...newOptionInputs, [i]: ''})
                                      }
                                    }}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                                  >
                                    + Ajouter
                                  </button>
                                </div>

                                {/* Options list */}
                                {field.options && field.options.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {field.options.map((opt, idx) => (
                                      <div key={idx} className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-lg">
                                        <span className="text-sm text-primary-700">{opt}</span>
                                        <button
                                          type="button"
                                          onClick={() => updateField(i, { 
                                            options: field.options?.filter((_, oIdx) => oIdx !== idx) 
                                          })}
                                          className="text-primary-400 hover:text-red-500 text-xs ml-1"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 text-center py-3 border-2 border-dashed rounded-lg">
                                    Aucune option ajoutée
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Required checkbox */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={e => updateField(i, { required: e.target.checked })}
                                  className="rounded"
                                />
                                <span>Champ obligatoire</span>
                              </label>
                              <button
                                onClick={() => removeField(i)}
                                className="text-red-600 text-sm hover:text-red-700 font-medium"
                              >
                                🗑 Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Save button */}
                {fields.length > 0 && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                    >
                      {saving ? 'Sauvegarde...' : '💾 Sauvegarder les champs'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-5xl mb-4">👈</div>
              <p className="text-gray-500">Sélectionnez un type de produit pour configurer ses champs personnalisés</p>
            </div>
          )}
        </div>
      </div>

      {/* Help section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 mb-3">💡 Types de champs disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <span>📝</span>
            <div><strong>Texte</strong> <span className="text-gray-500">- Nom, gravure...</span></div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <span>📄</span>
            <div><strong>Texte long</strong> <span className="text-gray-500">- Message, note</span></div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <span>🔢</span>
            <div><strong>Nombre</strong> <span className="text-gray-500">- Quantité, mesure</span></div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <span>🎨</span>
            <div><strong>Couleur</strong> <span className="text-gray-500">- Avec code hex</span></div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <span>📏</span>
            <div><strong>Taille</strong> <span className="text-gray-500">- S/M/L, pointures</span></div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <span>📋</span>
            <div><strong>Liste</strong> <span className="text-gray-500">- Choix déroulant</span></div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <span>⭕</span>
            <div><strong>Choix unique</strong> <span className="text-gray-500">- Radio</span></div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <span>☑️</span>
            <div><strong>Cases</strong> <span className="text-gray-500">- Multi-choix</span></div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <span>📅</span>
            <div><strong>Date</strong> <span className="text-gray-500">- Livraison, RDV</span></div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <span>✉️</span>
            <div><strong>Email</strong> <span className="text-gray-500">- Adresse email</span></div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <span>📞</span>
            <div><strong>Téléphone</strong> <span className="text-gray-500">- N° contact</span></div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <span>🖼️</span>
            <div><strong>Image URL</strong> <span className="text-gray-500">- Lien image</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
