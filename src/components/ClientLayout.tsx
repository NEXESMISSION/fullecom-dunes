'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CartDrawer from '@/components/CartDrawer'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Don't show navbar/cart on admin pages
  const isAdminPage = pathname?.startsWith('/store-admin-panel')
  
  if (isAdminPage) {
    return <>{children}</>
  }
  
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen pt-[124px] md:pt-[104px]">
        {children}
      </main>
    </>
  )
}
