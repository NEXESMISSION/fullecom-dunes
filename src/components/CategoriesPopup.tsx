'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronDown, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Category {
  id: string
  name: string
  image?: string
  parent_id: string | null
  children?: Category[]
}

interface CategoriesPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function CategoriesPopup({ isOpen, onClose }: CategoriesPopupProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  async function fetchCategories() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('product_types')
        .select('id, name, image, parent_id')
        .order('name')

      if (data) {
        const allCategories = data as Category[]
        const buildTree = (parentId: string | null): Category[] => {
          return allCategories
            .filter(c => c.parent_id === parentId)
            .map(c => ({
              ...c,
              children: buildTree(c.id)
            }))
        }
        setCategories(buildTree(null))
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: string) => {
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

  if (!isOpen) return null

  const renderCategory = (cat: Category, level: number = 0) => {
    const hasChildren = cat.children && cat.children.length > 0
    const isExpanded = expandedCategories.has(cat.id)
    const paddingLeft = 16 + level * 20

    return (
      <div key={cat.id}>
        <div 
          className={`flex items-center gap-3 py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition ${
            level === 0 ? 'bg-white' : 'bg-gray-50/50'
          }`}
          style={{ paddingLeft }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(cat.id)}
              className="p-1 hover:bg-gray-200 rounded transition"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}
          
          {cat.image && (
            <img 
              src={cat.image} 
              alt={cat.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          )}
          
          <Link 
            href={`/products?category=${encodeURIComponent(cat.name)}`}
            onClick={onClose}
            className="flex-1 font-medium text-gray-800 hover:text-primary-600"
          >
            {cat.name}
          </Link>
          
          {hasChildren && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              {cat.children?.length}
            </span>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {cat.children?.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Popup - Full screen on mobile, larger centered modal on desktop */}
      <div className="relative bg-white w-full sm:w-[95%] sm:max-w-2xl lg:max-w-3xl h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-6 w-6" />
            <h2 className="text-lg font-bold">Catégories</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Links */}
        <div className="flex gap-2 p-3 bg-gray-50 border-b overflow-x-auto scrollbar-hide">
          <Link
            href="/products"
            onClick={onClose}
            className="flex-shrink-0 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-full hover:bg-primary-700 transition"
          >
            Tous les Produits
          </Link>
          {categories.slice(0, 4).map(cat => (
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              onClick={onClose}
              className="flex-shrink-0 px-4 py-2 bg-white border text-sm font-medium rounded-full hover:border-primary-300 hover:text-primary-600 transition whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="mt-3 text-gray-500 text-sm">Chargement...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune catégorie disponible
            </div>
          ) : (
            <div>
              {categories.map(cat => renderCategory(cat))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50">
          <Link
            href="/products"
            onClick={onClose}
            className="block w-full py-3 text-center bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition"
          >
            Voir tous les produits
          </Link>
        </div>
      </div>
    </div>
  )
}
