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
  hero_bg_type: 'gradient' | 'color' | 'image'
  hero_bg_value: string
}

const GRADIENT_OPTIONS = [
  { label: 'بنفسجي', value: 'from-primary-600 to-primary-800' },
  { label: 'أزرق', value: 'from-blue-600 to-blue-800' },
  { label: 'أخضر', value: 'from-green-600 to-green-800' },
  { label: 'برتقالي', value: 'from-orange-500 to-red-600' },
  { label: 'وردي', value: 'from-pink-500 to-purple-600' },
  { label: 'رمادي', value: 'from-gray-700 to-gray-900' },
]

export default function LandingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [config, setConfig] = useState<LandingConfig>({
    showCategories: true,
    showBanners: true,
    showPromoImages: true,
    showProducts: true,
    categoriesTitle: 'تسوق حسب الفئة',
    bannersTitle: 'عروض مميزة',
    promoTitle: 'اكتشف المزيد',
    productsTitle: 'منتجات مميزة'
  })

  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    hero_bg_type: 'gradient',
    hero_bg_value: 'from-primary-600 to-primary-800'
  })

  // Stats
  const [stats, setStats] = useState({
    categories: 0,
    banners: 0,
    promoImages: 0,
    products: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      // Fetch landing config
      const configRes = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'landing_config')
        .maybeSingle()

      if (configRes.data?.value) {
        setConfig(prev => ({ ...prev, ...JSON.parse(configRes.data.value) }))
      }

      // Fetch hero settings
      const heroRes = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'hero_background')
        .maybeSingle()

      if (heroRes.data?.value) {
        setHeroSettings(JSON.parse(heroRes.data.value))
      }

      // Fetch stats
      const [catRes, banRes, promoRes, prodRes] = await Promise.all([
        supabase.from('product_types').select('id', { count: 'exact' }),
        supabase.from('banners').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('promo_images').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true)
      ])

      setStats({
        categories: catRes.count || 0,
        banners: banRes.count || 0,
        promoImages: promoRes.count || 0,
        products: prodRes.count || 0
      })
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
      toast.success('تم حفظ إعدادات الأقسام')
    } catch (error: any) {
      toast.error(error.message || 'فشل الحفظ')
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
      toast.success('تم حفظ إعدادات الخلفية')
    } catch (error: any) {
      toast.error(error.message || 'فشل الحفظ')
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
        <h1 className="text-2xl font-bold">إدارة الصفحة الرئيسية</h1>
        <p className="text-gray-500 text-sm">تحكم كامل في أقسام ومحتوى الصفحة الرئيسية</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-2xl font-bold text-primary-600">{stats.categories}</p>
          <p className="text-sm text-gray-500">فئة</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{stats.banners}</p>
          <p className="text-sm text-gray-500">بانر</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.promoImages}</p>
          <p className="text-sm text-gray-500">صورة ترويجية</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-2xl font-bold text-orange-600">{stats.products}</p>
          <p className="text-sm text-gray-500">منتج</p>
        </div>
      </div>

      {/* Hero Background Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">🎨 خلفية البانر الرئيسي</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">نوع الخلفية</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'gradient', label: 'تدرج لوني' },
              { value: 'color', label: 'لون واحد' },
              { value: 'image', label: 'صورة' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setHeroSettings({ ...heroSettings, hero_bg_type: option.value as any })}
                className={`px-4 py-2 rounded-lg border transition text-sm ${
                  heroSettings.hero_bg_type === option.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {heroSettings.hero_bg_type === 'gradient' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">اختر التدرج</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {GRADIENT_OPTIONS.map((gradient) => (
                <button
                  key={gradient.value}
                  onClick={() => setHeroSettings({ ...heroSettings, hero_bg_value: gradient.value })}
                  className={`p-2 rounded-lg border-2 transition ${
                    heroSettings.hero_bg_value === gradient.value ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <div className={`h-12 rounded bg-gradient-to-br ${gradient.value}`} />
                  <p className="text-xs text-center mt-1">{gradient.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {heroSettings.hero_bg_type === 'color' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">اختر اللون</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={heroSettings.hero_bg_value.startsWith('#') ? heroSettings.hero_bg_value : '#7c3aed'}
                onChange={(e) => setHeroSettings({ ...heroSettings, hero_bg_value: e.target.value })}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={heroSettings.hero_bg_value}
                onChange={(e) => setHeroSettings({ ...heroSettings, hero_bg_value: e.target.value })}
                placeholder="#7c3aed"
                className="px-3 py-2 border rounded-lg flex-1"
                dir="ltr"
              />
            </div>
          </div>
        )}

        {heroSettings.hero_bg_type === 'image' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">رابط الصورة</label>
            <input
              type="url"
              value={heroSettings.hero_bg_value}
              onChange={(e) => setHeroSettings({ ...heroSettings, hero_bg_value: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border rounded-lg"
              dir="ltr"
            />
            {heroSettings.hero_bg_value && heroSettings.hero_bg_type === 'image' && (
              <img src={heroSettings.hero_bg_value} alt="معاينة" className="mt-2 h-24 rounded border object-cover" />
            )}
          </div>
        )}

        <button
          onClick={saveHero}
          disabled={saving}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ الخلفية'}
        </button>
      </div>

      {/* Sections Management */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">📑 إدارة الأقسام</h2>
        
        <div className="space-y-4">
          {/* Categories Section */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showCategories}
                    onChange={(e) => setConfig({ ...config, showCategories: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="font-medium">قسم الفئات</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{stats.categories} فئة</span>
              </div>
              <Link href="/store-admin-panel/product-types" className="text-blue-600 text-sm hover:underline">
                إدارة الفئات ←
              </Link>
            </div>
            <input
              type="text"
              value={config.categoriesTitle}
              onChange={(e) => setConfig({ ...config, categoriesTitle: e.target.value })}
              placeholder="عنوان القسم"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Banners Section */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showBanners}
                    onChange={(e) => setConfig({ ...config, showBanners: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="font-medium">قسم البانرات</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{stats.banners} بانر</span>
              </div>
              <Link href="/store-admin-panel/banners" className="text-blue-600 text-sm hover:underline">
                إدارة البانرات ←
              </Link>
            </div>
            <input
              type="text"
              value={config.bannersTitle}
              onChange={(e) => setConfig({ ...config, bannersTitle: e.target.value })}
              placeholder="عنوان القسم"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Promo Images Section */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showPromoImages}
                    onChange={(e) => setConfig({ ...config, showPromoImages: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="font-medium">صور ترويجية</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{stats.promoImages} صورة</span>
              </div>
              <Link href="/store-admin-panel/promo-images" className="text-blue-600 text-sm hover:underline">
                إدارة الصور ←
              </Link>
            </div>
            <input
              type="text"
              value={config.promoTitle}
              onChange={(e) => setConfig({ ...config, promoTitle: e.target.value })}
              placeholder="عنوان القسم"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Products Section */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showProducts}
                    onChange={(e) => setConfig({ ...config, showProducts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="font-medium">المنتجات المميزة</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{stats.products} منتج</span>
              </div>
              <Link href="/store-admin-panel/products" className="text-blue-600 text-sm hover:underline">
                إدارة المنتجات ←
              </Link>
            </div>
            <input
              type="text"
              value={config.productsTitle}
              onChange={(e) => setConfig({ ...config, productsTitle: e.target.value })}
              placeholder="عنوان القسم"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <button
          onClick={saveConfig}
          disabled={saving}
          className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ إعدادات الأقسام'}
        </button>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">⚡ روابط سريعة</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/store-admin-panel/product-types" className="p-4 border rounded-lg text-center hover:bg-gray-50 transition">
            <span className="text-2xl">📋</span>
            <p className="text-sm mt-1">الفئات</p>
          </Link>
          <Link href="/store-admin-panel/banners" className="p-4 border rounded-lg text-center hover:bg-gray-50 transition">
            <span className="text-2xl">🖼️</span>
            <p className="text-sm mt-1">البانرات</p>
          </Link>
          <Link href="/store-admin-panel/promo-images" className="p-4 border rounded-lg text-center hover:bg-gray-50 transition">
            <span className="text-2xl">🎯</span>
            <p className="text-sm mt-1">صور ترويجية</p>
          </Link>
          <Link href="/store-admin-panel/products" className="p-4 border rounded-lg text-center hover:bg-gray-50 transition">
            <span className="text-2xl">🛍️</span>
            <p className="text-sm mt-1">المنتجات</p>
          </Link>
        </div>
      </div>

      {/* Preview Link */}
      <div className="text-center">
        <Link href="/" target="_blank" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
          معاينة الصفحة الرئيسية ←
        </Link>
      </div>
    </div>
  )
}
