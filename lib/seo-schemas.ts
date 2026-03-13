const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://faith-tracker.com";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Faith Tracker",
    url: BASE_URL,
    logo: `${BASE_URL}/assets/img/faith-tracker-logo.svg`,
    description: "AI-powered real estate platform in India",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hyderabad",
      addressRegion: "Telangana",
      addressCountry: "IN",
    },
    areaServed: [
      { "@type": "City", name: "Hyderabad" },
      { "@type": "City", name: "Bengaluru" },
      { "@type": "City", name: "Chennai" },
    ],
    sameAs: [
      "https://www.facebook.com/faithtracker/",
      "https://www.instagram.com/faithtracker/",
      "https://twitter.com/faithtracker",
      "https://www.youtube.com/channel/UC6hj6GKbSTlH0EKEBh1Vu_A",
    ],
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function softwareAppSchema(name: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url: `${BASE_URL}${url}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  };
}

export function serviceSchema(name: string, description: string, url: string, price?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${BASE_URL}${url}`,
    provider: {
      "@type": "Organization",
      name: "Faith Tracker",
    },
    areaServed: { "@type": "Country", name: "India" },
    ...(price && {
      offers: {
        "@type": "Offer",
        price,
        priceCurrency: "INR",
      },
    }),
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Faith Tracker",
    url: BASE_URL,
    telephone: "+91-9876543210",
    email: "info@faith-tracker.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hyderabad",
      addressRegion: "Telangana",
      postalCode: "500032",
      addressCountry: "IN",
    },
    openingHours: "Mo-Sa 09:00-18:00",
    priceRange: "₹₹",
  };
}

export function eventSchema(name: string, date: string, location: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    startDate: date,
    location: {
      "@type": "Place",
      name: location,
      address: { "@type": "PostalAddress", addressCountry: "IN" },
    },
    description,
    organizer: { "@type": "Organization", name: "Faith Tracker" },
  };
}

export function webPageSchema(name: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: `${BASE_URL}${url}`,
    isPartOf: { "@type": "WebSite", name: "Faith Tracker", url: BASE_URL },
  };
}
