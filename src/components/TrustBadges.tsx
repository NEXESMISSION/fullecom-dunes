import { Shield, Truck, RefreshCcw, Gift, Sparkles } from 'lucide-react'

const badges = [
  { icon: Shield, text: 'Paiement sécurisé' },
  { icon: Truck, text: 'Livraison rapide' },
  { icon: RefreshCcw, text: 'Satisfait ou remboursé' },
  { icon: Gift, text: 'Emballage cadeau' },
  { icon: Sparkles, text: 'Échantillons gratuits' }
]

export default function TrustBadges() {
  return (
    <section className="border-t border-b bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 lg:justify-between">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 text-gray-600"
            >
              <badge.icon className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
