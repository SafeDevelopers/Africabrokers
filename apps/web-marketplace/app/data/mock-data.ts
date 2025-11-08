// MOCK DATA - DO NOT USE IN PRODUCTION
// Production builds never import or start mocks
// In development, behind explicit flag (e.g., NEXT_PUBLIC_ENABLE_MOCKS=true)
// This file contains synthetic review data - rely on real endpoints that return []

export type ListingStatus = "Verified" | "Pending";
export type ListingPurpose = "Rent" | "Sale";

export type ListingReview = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  relationship: "Tenant" | "Buyer" | "Corporate" | "Prospect";
};

export type Listing = {
  id: string;
  title: string;
  purpose: ListingPurpose;
  propertyType: string;
  price: number;
  priceLabel: string;
  location: string;
  latitude: number;
  longitude: number;
  status: ListingStatus;
  brokerId: string;
  bedrooms: number | null;
  bathrooms: number;
  area: string;
  image: string;
  imageUrl?: string;
  gallery: string[];
  overallRating: number;
  description: string;
  features: string[];
  amenities: string[];
  reviews: ListingReview[];
};

export type Broker = {
  id: string;
  name: string;
  company: string;
  avatar: string;
  location: string;
  verified: boolean;
  experience: string;
  languages: string[];
  specialties: string[];
  phone: string;
  email: string;
  licenseNumber: string;
  bio: string;
  stats: {
    activeListings: number;
    closedDeals: number;
    responseTime: string;
    rating: number;
  };
};

// Synthetic review data - removed in production
// Rely on real endpoints that return []
export const listings: Listing[] = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_MOCKS !== 'true'
  ? [] // Production: empty array, mocks disabled
  : [
  {
    id: "listing-1",
    title: "Modern 3BR Apartment in Bole",
    purpose: "Rent",
    propertyType: "Apartment",
    price: 25000,
    priceLabel: "ETB 25,000 / month",
    location: "Bole, Addis Ababa",
    latitude: 8.9902,
    longitude: 38.7896,
    status: "Verified",
    brokerId: "broker-1",
    bedrooms: 3,
    bathrooms: 2,
    area: "120 sq m",
    image: "🏠",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-0ef3c08b6651?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-0ef3c08b6651?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1616594039964-7c2ecb878b95?auto=format&fit=crop&w=1600&q=80"
    ],
    overallRating: 4.7,
    description:
      "Sun-filled apartment in the heart of Bole with modern finishes, secure parking, and elevator access. Walking distance to cafes, gyms, and the airport road.",
    features: ["Open floor living area", "24/7 security", "Balcony with city views"],
    amenities: ["Back-up generator", "Furnished option", "High-speed internet"],
    reviews: [
      {
        id: "review-1",
        author: "Lulit M.",
        rating: 5,
        comment: "Beautiful interior and the broker handled all paperwork smoothly. Internet is very fast.",
        date: "Feb 2025",
        relationship: "Tenant"
      },
      {
        id: "review-2",
        author: "Abebe T.",
        rating: 4,
        comment: "Great location for frequent flyers. Parking space is a bit tight but manageable.",
        date: "Jan 2025",
        relationship: "Corporate"
      }
    ]
  },
  {
    id: "listing-2",
    title: "Commercial Office Space — Kazanchis",
    purpose: "Sale",
    propertyType: "Office",
    price: 5200000,
    priceLabel: "ETB 5,200,000",
    location: "Kazanchis, Addis Ababa",
    latitude: 9.0105,
    longitude: 38.7694,
    status: "Pending",
    brokerId: "broker-2",
    bedrooms: null,
    bathrooms: 1,
    area: "200 sq m",
    image: "🏢",
    imageUrl:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1529429617124-aee711a6bbf0?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1507208773393-40d9fc670acf?auto=format&fit=crop&w=1600&q=80"
    ],
    overallRating: 4.3,
    description:
      "Flexible open-plan office with panoramic skyline views. Ideal for tech startups or consultancies seeking a central business district address.",
    features: ["Four-car underground parking", "Smart access control", "Dedicated reception"],
    amenities: ["Fiber internet", "Conference rooms", "Shared cafeteria"],
    reviews: [
      {
        id: "review-3",
        author: "Meleket Consulting",
        rating: 4,
        comment: "Excellent sunlight and meeting spaces. Waiting for final verification to move in.",
        date: "Dec 2023",
        relationship: "Prospect"
      },
      {
        id: "review-4",
        author: "Sami H.",
        rating: 4,
        comment: "Security setup is impressive. Hoping for a small price negotiation.",
        date: "Nov 2023",
        relationship: "Buyer"
      }
    ]
  },
  {
    id: "listing-3",
    title: "Luxury Villa with Private Garden",
    purpose: "Rent",
    propertyType: "Villa",
    price: 45000,
    priceLabel: "ETB 45,000 / month",
    location: "Old Airport, Addis Ababa",
    latitude: 8.9981,
    longitude: 38.7936,
    status: "Verified",
    brokerId: "broker-3",
    bedrooms: 4,
    bathrooms: 3,
    area: "300 sq m",
    image: "🏡",
    imageUrl:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1617098790959-2b929e5f2f8b?auto=format&fit=crop&w=1600&q=80"
    ],
    overallRating: 4.9,
    description:
      "Elegant villa tucked away in a quiet residential street. Features landscaped garden, guest house, and a chef's kitchen with imported appliances.",
    features: ["Dedicated staff quarters", "Two-car garage", "Heated floors"],
    amenities: ["Private garden", "Gated community", "Solar water heating"],
    reviews: [
      {
        id: "review-5",
        author: "Embassy Housing Team",
        rating: 5,
        comment: "One of the best-maintained villas we’ve seen. The broker handled all security checks professionally.",
        date: "Feb 2025",
        relationship: "Corporate"
      },
      {
        id: "review-6",
        author: "Yeshi D.",
        rating: 5,
        comment: "The garden is stunning and perfect for kids. Quick maintenance response as well.",
        date: "Jan 2025",
        relationship: "Tenant"
      }
    ]
  },
  {
    id: "listing-4",
    title: "Studio Apartment Near Addis Ababa University",
    purpose: "Rent",
    propertyType: "Studio",
    price: 8500,
    priceLabel: "ETB 8,500 / month",
    location: "6 Kilo, Addis Ababa",
    latitude: 9.0375,
    longitude: 38.7611,
    status: "Verified",
    brokerId: "broker-1",
    bedrooms: 1,
    bathrooms: 1,
    area: "45 sq m",
    image: "🏘️",
    imageUrl:
      "https://images.unsplash.com/photo-1522156373667-4c7234bbd804?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512914890250-353c97c9e7bb?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1616593990230-5d2c98c425ce?auto=format&fit=crop&w=1600&q=80"
    ],
    overallRating: 4.6,
    description:
      "Compact studio ideal for students and young professionals. Fully furnished with kitchenette, study nook, and on-site laundry facilities.",
    features: ["Keyless entry", "In-unit laundry", "City views"],
    amenities: ["Secure compound", "Cleaning services", "Shared rooftop terrace"],
    reviews: [
      {
        id: "review-7",
        author: "Martha W.",
        rating: 4,
        comment: "Perfect for my graduate studies. Quick to walk to campus and lots of natural light.",
        date: "Feb 2025",
        relationship: "Tenant"
      },
      {
        id: "review-8",
        author: "Daniel K.",
        rating: 5,
        comment: "Furnished setup saved me a ton. Laundry service is reliable.",
        date: "Jan 2025",
        relationship: "Tenant"
      }
    ]
  },
  {
    id: "listing-5",
    title: "Boutique Retail Space on Bole Road",
    purpose: "Rent",
    propertyType: "Retail",
    price: 32000,
    priceLabel: "ETB 32,000 / month",
    location: "Bole, Addis Ababa",
    latitude: 8.9958,
    longitude: 38.7894,
    status: "Verified",
    brokerId: "broker-2",
    bedrooms: null,
    bathrooms: 1,
    area: "90 sq m",
    image: "🛍️",
    imageUrl:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1529429617124-aee711a6bbf0?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=80"
    ],
    overallRating: 4.4,
    description:
      "High-visibility ground floor space with floor-to-ceiling glass frontage. Heavy foot traffic and parking directly outside the unit.",
    features: ["Front signage included", "Dedicated storage room", "24/7 security patrol"],
    amenities: ["Shared washrooms", "Generator backup", "Customer parking"],
    reviews: [
      {
        id: "review-9",
        author: "Selam Boutique",
        rating: 4,
        comment: "Great walk-in traffic and secure building. Hoping for more evening lighting outside.",
        date: "Dec 2023",
        relationship: "Tenant"
      },
      {
        id: "review-10",
        author: "Kidist F.",
        rating: 5,
        comment: "Perfect for launching our pop-up. The broker helped with signage approvals.",
        date: "Nov 2023",
        relationship: "Tenant"
      }
    ]
  }
];

// Synthetic broker data - removed in production
// Rely on real endpoints that return []
export const brokers: Broker[] = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_MOCKS !== 'true'
  ? [] // Production: empty array, mocks disabled
  : [
  {
    id: "broker-1",
    name: "Desta Real Estate",
    company: "Desta Real Estate",
    avatar: "👩🏾‍💼",
    location: "Bole, Addis Ababa",
    verified: true,
    experience: "12 years experience",
    languages: ["Amharic", "English"],
    specialties: ["Residential rentals", "Corporate relocations", "Student housing"],
    phone: "+251 90 123 4567",
    email: "hello@destaestate.com",
    licenseNumber: "ET-REA-00891",
    bio:
      "We help families and professionals find verified properties across Addis Ababa. Known for responsive service, transparent process, and deep neighborhood expertise.",
    stats: {
      activeListings: 42,
      closedDeals: 310,
      responseTime: "< 2 hours",
      rating: 4.8
    }
  },
  {
    id: "broker-2",
    name: "Prime Properties Ltd",
    company: "Prime Properties Ltd",
    avatar: "🧑🏾‍💼",
    location: "Kazanchis, Addis Ababa",
    verified: false,
    experience: "7 years experience",
    languages: ["Amharic", "English"],
    specialties: ["Commercial leasing", "Retail spaces", "Mixed-use developments"],
    phone: "+251 91 222 3344",
    email: "contact@primeproperties.com",
    licenseNumber: "ET-REA-01342",
    bio:
      "Commercial specialists focused on Addis Ababa's emerging business corridors. We match fast-growing companies with flexible office and retail options.",
    stats: {
      activeListings: 28,
      closedDeals: 185,
      responseTime: "4 hours",
      rating: 4.2
    }
  },
  {
    id: "broker-3",
    name: "Elite Homes",
    company: "Elite Homes",
    avatar: "👩🏾‍💼",
    location: "Old Airport, Addis Ababa",
    verified: true,
    experience: "15 years experience",
    languages: ["Amharic", "English", "French"],
    specialties: ["Luxury villas", "Corporate leases", "Embassy housing"],
    phone: "+251 98 765 4321",
    email: "luxury@elitehomes.com",
    licenseNumber: "ET-REA-00422",
    bio:
      "Boutique brokerage representing high-end residences and corporate leases. Trusted by embassy staff and multinational executives relocating to Addis Ababa.",
    stats: {
      activeListings: 19,
      closedDeals: 248,
      responseTime: "3 hours",
      rating: 4.9
    }
  }
];

// Synthetic stats - removed in production
// Rely on real endpoints that return []
export const brokerStats = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_MOCKS !== 'true'
  ? [] // Production: empty array, mocks disabled
  : [
      { label: "Verified Brokers", value: "156+" },
      { label: "Active Listings", value: "1,247" },
      { label: "Successful Deals", value: "892" },
      { label: "Avg Response Time", value: "< 2 hrs" }
    ];

export const getListingById = (id: string) => listings.find((listing) => listing.id === id);

export const getBrokerById = (id: string) => brokers.find((broker) => broker.id === id);

export const getListingsByBroker = (brokerId: string) =>
  listings.filter((listing) => listing.brokerId === brokerId);

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  plan: "Free" | "Pro";
  joinedAt: string;
  phone: string;
};

export type UserMetric = {
  label: string;
  value: string;
  trend: "up" | "down" | "steady";
  helper: string;
};

export type FavoriteListing = {
  id: string;
  listingId: string;
  addedAt: string;
  notes?: string;
};

export type InquiryStatus = "Awaiting Broker" | "Broker Responded" | "Meeting Scheduled" | "Closed";

export type InquiryRecord = {
  id: string;
  listingId: string;
  brokerId: string;
  status: InquiryStatus;
  lastUpdated: string;
  submittedAt: string;
  preferredContact: "Email" | "Phone";
  message: string;
};

// Synthetic user data - removed in production
// Rely on real endpoints that return []
export const currentUser: UserProfile | null = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_MOCKS !== 'true'
  ? null // Production: null, mocks disabled
  : {
      id: "user-1",
      name: "Hanna Solomon",
      email: "hanna.solomon@example.com",
      avatar: "🧑🏾‍💼",
      location: "Addis Ababa, Ethiopia",
      plan: "Pro",
      joinedAt: "June 2023",
      phone: "+251 93 456 7890"
    };

// Synthetic metrics - removed in production
// Rely on real endpoints that return []
export const userMetrics: UserMetric[] = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_MOCKS !== 'true'
  ? [] // Production: empty array, mocks disabled
  : [
      {
        label: "Saved Properties",
        value: "6",
        trend: "up",
        helper: "+2 this month"
      },
      {
        label: "Broker Replies",
        value: "92%",
        trend: "up",
        helper: "Avg response within 3 hrs"
      },
      {
        label: "Scheduled Visits",
        value: "3",
        trend: "steady",
        helper: "2 upcoming this week"
      }
    ];

// Synthetic favorites - removed in production
// Rely on real endpoints that return []
export const userFavorites: FavoriteListing[] = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_MOCKS !== 'true'
  ? [] // Production: empty array, mocks disabled
  : [
      {
        id: "fav-1",
        listingId: "listing-1",
        addedAt: "2025-02-12",
        notes: "Perfect for relocating parents, confirm parking availability."
      },
      {
        id: "fav-2",
        listingId: "listing-3",
        addedAt: "2025-02-05",
        notes: "Schedule second viewing with Elite Homes."
      },
      {
        id: "fav-3",
        listingId: "listing-5",
        addedAt: "2025-01-22"
      },
      {
        id: "fav-4",
        listingId: "listing-4",
        addedAt: "2025-01-18"
      },
      {
        id: "fav-5",
        listingId: "listing-2",
        addedAt: "2023-12-30",
        notes: "Compare financing options with bank."
      }
    ];

// Synthetic inquiries - removed in production
// Rely on real endpoints that return []
export const userInquiries: InquiryRecord[] = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_MOCKS !== 'true'
  ? [] // Production: empty array, mocks disabled
  : [
      {
        id: "inq-1",
        listingId: "listing-1",
        brokerId: "broker-1",
        status: "Meeting Scheduled",
        submittedAt: "2025-02-10",
        lastUpdated: "2025-02-11",
        preferredContact: "Phone",
        message:
          "Interested in a 12-month lease starting March. Could we do an evening viewing next week?"
      },
      {
        id: "inq-2",
        listingId: "listing-5",
        brokerId: "broker-2",
        status: "Awaiting Broker",
        submittedAt: "2025-02-08",
        lastUpdated: "2025-02-08",
        preferredContact: "Email",
        message:
          "Do you allow signage customization for the retail space? Also need details on service charges."
      },
      {
        id: "inq-3",
        listingId: "listing-3",
        brokerId: "broker-3",
        status: "Broker Responded",
        submittedAt: "2025-01-28",
        lastUpdated: "2025-02-02",
        preferredContact: "Email",
        message: "Could the villa be partially furnished? We're relocating from Nairobi."
      },
      {
        id: "inq-4",
        listingId: "listing-2",
        brokerId: "broker-2",
        status: "Closed",
        submittedAt: "2023-12-18",
        lastUpdated: "2025-01-05",
        preferredContact: "Phone",
        message: "Finalized purchase. Please share transfer checklist."
      }
    ];
