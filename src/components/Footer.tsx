import { Store, Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img 
                src="/logo dunes.png" 
                alt="Dunes d'Or" 
                className="h-12 w-auto object-contain"
              />
              <span className="text-xl font-bold text-white">Dunes d'Or</span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md">
              Votre destination shopping en ligne. Produits de qualité, livraison rapide et paiement à la livraison.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-primary-400 transition-colors">Accueil</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-primary-400 transition-colors">Produits</Link></li>
              <li><Link href="/checkout" className="text-gray-400 hover:text-primary-400 transition-colors">Panier</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4 text-primary-400" />
                +216 12 345 678
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4 text-primary-400" />
                support@dunesdor.tn
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Dunes d'Or. Tous droits réservés.</p>
          <Link href="/store-admin-panel/login" className="hover:text-primary-400 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
