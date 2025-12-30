'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

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

export default function SettingsPage() {
  const [settings, setSettings] = useState<HeroSettings>({
    hero_bg_type: 'gradient',
    hero_bg_value: 'from-primary-600 to-primary-800'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'hero_background')
        .maybeSingle()

      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value)
          setSettings(parsed)
        } catch (e) {
          // Keep default
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'hero_background',
          value: JSON.stringify(settings),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

      if (error) throw error
      toast.success('تم حفظ الإعدادات')
    } catch (error: any) {
      console.error('Error saving settings:', error)
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
      <h1 className="text-2xl font-bold">إعدادات الموقع</h1>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">خلفية الصفحة الرئيسية</h2>
        
        {/* Background Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">نوع الخلفية</label>
          <div className="flex gap-3">
            {[
              { value: 'gradient', label: 'تدرج لوني' },
              { value: 'color', label: 'لون واحد' },
              { value: 'image', label: 'صورة' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSettings({ ...settings, hero_bg_type: option.value as any })}
                className={`px-4 py-2 rounded-lg border transition ${
                  settings.hero_bg_type === option.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gradient Options */}
        {settings.hero_bg_type === 'gradient' && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">اختر التدرج</label>
            <div className="grid grid-cols-3 gap-3">
              {GRADIENT_OPTIONS.map((gradient) => (
                <button
                  key={gradient.value}
                  onClick={() => setSettings({ ...settings, hero_bg_value: gradient.value })}
                  className={`p-4 rounded-lg border-2 transition ${
                    settings.hero_bg_value === gradient.value
                      ? 'border-blue-600'
                      : 'border-transparent'
                  }`}
                >
                  <div className={`h-16 rounded bg-gradient-to-br ${gradient.value}`} />
                  <p className="text-sm text-center mt-2">{gradient.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Picker */}
        {settings.hero_bg_type === 'color' && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">اختر اللون</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={settings.hero_bg_value.startsWith('#') ? settings.hero_bg_value : '#7c3aed'}
                onChange={(e) => setSettings({ ...settings, hero_bg_value: e.target.value })}
                className="w-16 h-16 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.hero_bg_value}
                onChange={(e) => setSettings({ ...settings, hero_bg_value: e.target.value })}
                placeholder="#7c3aed"
                className="px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Image URL */}
        {settings.hero_bg_type === 'image' && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">رابط الصورة</label>
            <input
              type="url"
              value={settings.hero_bg_value}
              onChange={(e) => setSettings({ ...settings, hero_bg_value: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border rounded-lg"
              dir="ltr"
            />
            {settings.hero_bg_value && settings.hero_bg_type === 'image' && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-2">معاينة:</p>
                <div 
                  className="h-32 rounded-lg bg-cover bg-center border"
                  style={{ backgroundImage: `url(${settings.hero_bg_value})` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">معاينة الخلفية</label>
          <div 
            className={`h-40 rounded-lg flex items-center justify-center text-white ${
              settings.hero_bg_type === 'gradient' ? `bg-gradient-to-br ${settings.hero_bg_value}` : ''
            }`}
            style={
              settings.hero_bg_type === 'color' 
                ? { backgroundColor: settings.hero_bg_value }
                : settings.hero_bg_type === 'image'
                ? { backgroundImage: `url(${settings.hero_bg_value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : {}
            }
          >
            <div className="text-center bg-black/30 p-4 rounded-lg">
              <h3 className="text-xl font-bold">تسوق منتجات عالية الجودة</h3>
              <p className="text-sm opacity-80">معاينة الخلفية</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>
    </div>
  )
}
