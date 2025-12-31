'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface LandingConfig {
  showCategories: boolean
  showBanners: boolean
  showPromoImages: boolean
  showProducts: boolean
  categoriesTitle: string
  bannersTitle: string
  promoTitle: string
  productsTitle: string
}

interface HeroSettings {
  hero_bg_type: 'gradient' | 'color' | 'image' | 'custom-gradient'
  hero_bg_value: string
  customGradientFrom?: string
  customGradientTo?: string
}

export default function LandingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [config, setConfig] = useState<LandingConfig>({
    showCategories: true,
    showBanners: true,
    showPromoImages: true,
    showProducts: true,
    categoriesTitle: 'Parcourir par Catégorie',
    bannersTitle: 'Offres Spéciales',
    promoTitle: 'À Découvrir',
    productsTitle: 'Produits Vedettes'
  })

  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    hero_bg_type: 'image',
    hero_bg_value: '',
    customGradientFrom: '#002366',
    customGradientTo: '#001c52'
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const configRes = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'landing_config')
        .maybeSingle()

      if (configRes.data?.value) {
        setConfig(prev => ({ ...prev, ...JSON.parse(configRes.data.value) }))
      }

      const heroRes = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'hero_background')
        .maybeSingle()

      if (heroRes.data?.value) {
        setHeroSettings(JSON.parse(heroRes.data.value))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveConfig() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'landing_config',
          value: JSON.stringify(config),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

      if (error) throw error
      toast.success('Paramètres sauvegardés')
    } catch (error: any) {
      toast.error(error.message || 'Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function saveHero() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'hero_background',
          value: JSON.stringify(heroSettings),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

      if (error) throw error
      toast.success('Arrière-plan sauvegardé')
    } catch (error: any) {
      toast.error(error.message || 'Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="bg-white rounded-lg h-32" />
        <div className="bg-white rounded-lg h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres de la Page d'Accueil</h1>
        <p className="text-gray-500 text-sm">Configurez les titres des sections</p>
      </div>

      {/* Section Titles */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Titres des Sections</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre Catégories</label>
            <input
              type="text"
              value={config.categoriesTitle}
              onChange={(e) => setConfig({ ...config, categoriesTitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Titre Bannières</label>
            <input
              type="text"
              value={config.bannersTitle}
              onChange={(e) => setConfig({ ...config, bannersTitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Titre Promos</label>
            <input
              type="text"
              value={config.promoTitle}
              onChange={(e) => setConfig({ ...config, promoTitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Titre Produits</label>
            <input
              type="text"
              value={config.productsTitle}
              onChange={(e) => setConfig({ ...config, productsTitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={saveConfig}
          disabled={saving}
          className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      {/* Hero Background */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Arrière-plan du Carousel</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Type</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'image', label: 'Image' },
              { value: 'custom-gradient', label: 'Dégradé' },
              { value: 'color', label: 'Couleur' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setHeroSettings({ ...heroSettings, hero_bg_type: option.value as any })}
                className={`px-4 py-2 rounded-lg border transition text-sm ${
                  heroSettings.hero_bg_type === option.value
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {heroSettings.hero_bg_type === 'image' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">URL de l'image</label>
            <input
              type="url"
              value={heroSettings.hero_bg_value}
              onChange={(e) => setHeroSettings({ ...heroSettings, hero_bg_value: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        )}

        {heroSettings.hero_bg_type === 'custom-gradient' && (
          <div className="flex items-center gap-4 mb-4">
            <div>
              <label className="block text-xs mb-1">Couleur 1</label>
              <input
                type="color"
                value={heroSettings.customGradientFrom || '#002366'}
                onChange={(e) => setHeroSettings({ ...heroSettings, customGradientFrom: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Couleur 2</label>
              <input
                type="color"
                value={heroSettings.customGradientTo || '#001c52'}
                onChange={(e) => setHeroSettings({ ...heroSettings, customGradientTo: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {heroSettings.hero_bg_type === 'color' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Couleur</label>
            <input
              type="color"
              value={heroSettings.hero_bg_value.startsWith('#') ? heroSettings.hero_bg_value : '#002366'}
              onChange={(e) => setHeroSettings({ ...heroSettings, hero_bg_value: e.target.value })}
              className="w-12 h-10 rounded cursor-pointer"
            />
          </div>
        )}

        <button
          onClick={saveHero}
          disabled={saving}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <div className="text-center">
        <Link href="/" target="_blank" className="text-primary-600 hover:underline">
          Voir la page d'accueil →
        </Link>
      </div>
    </div>
  )
}
