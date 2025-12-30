import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import CartDrawer from '@/components/CartDrawer'

const cairo = Cairo({ subsets: ['arabic', 'latin'] })

export const metadata: Metadata = {
  title: 'متجرنا - تسوق بسهولة',
  description: 'منتجات عالية الجودة مع الدفع عند الاستلام. بدون متاعب، بدون دفع مسبق.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        <CartProvider>
          <Toaster position="bottom-right" />
          <Navbar />
          <CartDrawer />
          <main className="min-h-screen pt-16">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  )
}
