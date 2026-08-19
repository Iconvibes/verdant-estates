import { useEffect } from 'react'

/**
 * Injects a JSON-LD script tag into <head> and removes it on unmount.
 * Pass a plain object — it will be serialised automatically.
 */
export default function SEO({ data }) {
  useEffect(() => {
    if (!data) return undefined

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [data])

  return null
}

// --- Pre-built structured data generators ---

export function organisationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Verdant Estates',
    description:
      "Verdant Estates curates Lagos's most serene addresses — light-filled modern homes wrapped in greenery.",
    url: 'https://verdantestates.ng',
    logo: 'https://verdantestates.ng/images/logo.png',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '18B Akin Adesola Street',
      addressLocality: 'Victoria Island',
      addressRegion: 'Lagos',
      addressCountry: 'NG',
    },
    telephone: '+2348000000000',
    email: 'hello@verdantestates.ng',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '16:00',
      },
    ],
    priceRange: '₦185,000,000 – ₦1,950,000,000',
    areaServed: {
      '@type': 'City',
      name: 'Lagos',
    },
  }
}

export function listingSchema(property) {
  if (!property) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.name,
    description: property.tagline || property.description,
    image: property.image?.startsWith('http')
      ? property.image
      : `https://verdantestates.ng${property.image}`,
    url: `https://verdantestates.ng/listing/${property.id}`,
    brand: {
      '@type': 'Organization',
      name: 'Verdant Estates',
    },
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'NGN',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'RealEstateAgent',
        name: 'Verdant Estates',
      },
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Bedrooms',
        value: property.beds,
      },
      {
        '@type': 'PropertyValue',
        name: 'Bathrooms',
        value: property.baths,
      },
      {
        '@type': 'PropertyValue',
        name: 'Living Area',
        value: `${property.area} m²`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Property Type',
        value: property.type,
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
    },
  }
}

export function breadcrumbSchema(items) {
  if (!items?.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url?.startsWith('http') ? item.url : `https://verdantestates.ng${item.url}`,
    })),
  }
}

export function faqSchema(questions) {
  if (!questions?.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }
}
