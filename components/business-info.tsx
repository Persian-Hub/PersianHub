interface Business {
  id: string
  name: string
  description?: string
  business_services?: { service_name: string }[]
}

interface BusinessInfoProps {
  business: Business
}

export function BusinessInfo({ business }: BusinessInfoProps) {
  return (
    <div className="space-y-8">
      {/* About */}
      {business.description && (
        <section>
          <h2 className="font-serif font-bold text-2xl text-gray-900 mb-4">About</h2>
          <p className="font-sans text-gray-700 leading-relaxed">{business.description}</p>
        </section>
      )}

      {/* Services */}
      {business.business_services && business.business_services.length > 0 && (
        <section>
          <h2 className="font-serif font-bold text-2xl text-gray-900 mb-4">Services</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {business.business_services.map((service, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-cyan-800 rounded-full mr-3" />
                <span className="font-sans text-gray-700">{service.service_name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      <section>
        <h2 className="font-serif font-bold text-2xl text-gray-900 mb-4">Gallery</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={`/placeholder.svg?height=300&width=300&query=business-gallery-${i}`}
                alt={`${business.name} gallery ${i}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
