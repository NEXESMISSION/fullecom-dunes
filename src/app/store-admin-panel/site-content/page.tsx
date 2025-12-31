'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface SiteContent {
  // Brand
  logoUrl: string
  logoSize: 'small' | 'medium' | 'large'
  storeName: string
  faviconUrl: string
  announcementText: string
  
  // Promo Banner
  promoBannerImage: string
  promoBannerTitle: string
  promoBannerSubtitle: string
  
  // CTA
  ctaTitle: string
  ctaSubtitle: string
  ctaButtonText: string
  
  // Footer
  footerDescription: string
  footerPhone: string
  footerEmail: string
  footerAddress: string
  footerSupportText: string
}

const DEFAULT_CONTENT: SiteContent = {
  logoUrl: '',
  logoSize: 'medium',
  storeName: 'Notre Boutique',
  faviconUrl: '',
  announcementText: 'Livraison gratuite à partir de 110 DT d\'achat 🚚',
  promoBannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&h=300&fit=crop',
  promoBannerTitle: 'Offres Spéciales',
  promoBannerSubtitle: 'Découvrez nos meilleures offres du moment',
  ctaTitle: 'Prêt à Commander?',
  ctaSubtitle: 'Pas besoin de compte. Ajoutez vos produits et payez à la livraison.',
  ctaButtonText: 'Voir les Produits',
  footerDescription: 'Produits de qualité livrés à votre porte. Paiement à la livraison.',
  footerPhone: '+216 12 345 678',
  footerEmail: 'support@store.com',
  footerAddress: 'Rue du Commerce, Ville',
  footerSupportText: 'Nous sommes là pour vous aider. Contactez-nous pour toute question.'
}

export default function SiteContentPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT)

  useEffect(() => {
    fetchContent()
  }, [])

  async function fetchContent() {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'site_content')
        .maybeSingle()

      if (data?.value) {
        setContent(prev => ({ ...prev, ...JSON.parse(data.value) }))
      }
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveContent() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'site_content',
          value: JSON.stringify(content),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

      if (error) throw error
      toast.success('Contenu sauvegardé')
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
        <h1 className="text-2xl font-bold">Contenu du Site</h1>
        <p className="text-gray-500 text-sm">Personnalisez les textes et visuels du site</p>
      </div>

      {/* Logo & Brand */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">🏪 Logo et Marque</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom du magasin</label>
            <input
              type="text"
              value={content.storeName}
              onChange={(e) => setContent({ ...content, storeName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Notre Boutique"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL du logo (optionnel)</label>
            <input
              type="url"
              value={content.logoUrl}
              onChange={(e) => setContent({ ...content, logoUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://example.com/logo.png"
              dir="ltr"
            />
            {content.logoUrl && (
              <div className="mt-2 p-3 bg-gray-100 rounded-lg inline-block">
                <img src={content.logoUrl} alt="Aperçu du logo" className="max-h-16 object-contain" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Taille du logo</label>
            <div className="flex gap-2">
              {[
                { value: 'small', label: 'Petit', size: 'h-6' },
                { value: 'medium', label: 'Moyen', size: 'h-8' },
                { value: 'large', label: 'Grand', size: 'h-10' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setContent({ ...content, logoSize: option.value as any })}
                  className={`px-4 py-2 rounded-lg border transition text-sm ${
                    content.logoSize === option.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Favicon (optionnel)</label>
            <input
              type="url"
              value={content.faviconUrl}
              onChange={(e) => setContent({ ...content, faviconUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://example.com/favicon.ico"
              dir="ltr"
            />
            {content.faviconUrl && (
              <div className="mt-2 p-2 bg-gray-100 rounded-lg inline-block">
                <img src={content.faviconUrl} alt="Aperçu" className="w-8 h-8 object-contain" />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Icône affichée dans l'onglet du navigateur</p>
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">🎯 Bannière Promotionnelle</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Image de la bannière</label>
            <input
              type="url"
              value={content.promoBannerImage}
              onChange={(e) => setContent({ ...content, promoBannerImage: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://..."
              dir="ltr"
            />
            {content.promoBannerImage && (
              <div className="mt-2 relative h-32 rounded-lg overflow-hidden">
                <img src={content.promoBannerImage} alt="Aperçu" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Titre</label>
            <input
              type="text"
              value={content.promoBannerTitle}
              onChange={(e) => setContent({ ...content, promoBannerTitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Offres Spéciales"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sous-titre</label>
            <input
              type="text"
              value={content.promoBannerSubtitle}
              onChange={(e) => setContent({ ...content, promoBannerSubtitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Découvrez nos meilleures offres du moment"
            />
          </div>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">📢 Barre d'annonce</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Texte d'annonce</label>
            <input
              type="text"
              value={content.announcementText}
              onChange={(e) => setContent({ ...content, announcementText: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Livraison gratuite à partir de 110 DT 🚚"
            />
            <p className="text-xs text-gray-500 mt-1">Apparaît en haut de la page</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">📢 Section CTA</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre</label>
            <input
              type="text"
              value={content.ctaTitle}
              onChange={(e) => setContent({ ...content, ctaTitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Prêt à commander?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sous-titre</label>
            <textarea
              value={content.ctaSubtitle}
              onChange={(e) => setContent({ ...content, ctaSubtitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg resize-none"
              rows={2}
              placeholder="Pas besoin de compte..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Texte du bouton</label>
            <input
              type="text"
              value={content.ctaButtonText}
              onChange={(e) => setContent({ ...content, ctaButtonText: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Voir les produits"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">📋 Pied de page</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={content.footerDescription}
              onChange={(e) => setContent({ ...content, footerDescription: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Produits de qualité livrés à votre porte"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Téléphone</label>
              <input
                type="text"
                value={content.footerPhone}
                onChange={(e) => setContent({ ...content, footerPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="+216 12 345 678"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={content.footerEmail}
                onChange={(e) => setContent({ ...content, footerEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="support@store.com"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adresse</label>
              <input
                type="text"
                value={content.footerAddress}
                onChange={(e) => setContent({ ...content, footerAddress: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Ville"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Texte de support</label>
            <input
              type="text"
              value={content.footerSupportText}
              onChange={(e) => setContent({ ...content, footerSupportText: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Nous sommes là pour vous aider"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveContent}
        disabled={saving}
        className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
      </button>
    </div>
  )
}
