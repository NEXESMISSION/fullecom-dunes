import { Cairo } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from 'react-hot-toast'
import DynamicMetadata from '@/components/DynamicMetadata'
import ClientLayout from '@/components/ClientLayout'

const cairo = Cairo({ subsets: ['arabic', 'latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" dir="ltr">
      <DynamicMetadata />
      <body className={cairo.className}>
        <CartProvider>
          <Toaster position="bottom-right" />
          <ClientLayout>{children}</ClientLayout>
        </CartProvider>
      </body>
    </html>
  )
}
