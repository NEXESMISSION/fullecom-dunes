'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DynamicMetadata() {
  useEffect(() => {
    loadMetadata()
  }, [])

  async function loadMetadata() {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'site_content')
        .maybeSingle()

      if (data?.value) {
        const content = JSON.parse(data.value)
        
        // Update page title
        if (content.storeName) {
          document.title = `${content.storeName} - تسوق بسهولة`
        }

        // Update favicon
        if (content.faviconUrl) {
          // Remove existing favicons
          const existingLinks = document.querySelectorAll("link[rel*='icon']")
          existingLinks.forEach(link => link.remove())

          // Add new favicon
          const link = document.createElement('link')
          link.rel = 'icon'
          link.href = content.faviconUrl
          document.head.appendChild(link)
        }
      }
    } catch (error) {
      console.error('Failed to load metadata:', error)
    }
  }

  return null
}
