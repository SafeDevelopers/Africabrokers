export type MockBroker = {
  id: string;
  name: string;
  license: string;
  approved: boolean;
  rating: number; // 0-5
  reviews: number;
  phone?: string;
  email?: string;
  office?: string;
  avatarColor?: string;
};

// MOCK DATA - DO NOT USE IN PRODUCTION
// Production builds never import or start mocks
// In development, behind explicit flag (e.g., EXPO_PUBLIC_ENABLE_MOCKS=true)
// This file contains synthetic broker/scan data - rely on real endpoints that return []

export const MOCK_BROKERS: MockBroker[] = process.env.NODE_ENV === 'production' || process.env.EXPO_PUBLIC_ENABLE_MOCKS !== 'true'
  ? [] // Production: empty array, mocks disabled
  : [
  {
    id: "BR-10293",
    name: "Jane K. Mbeki",
    license: "LIC-AB-0001",
    approved: true,
    rating: 4.8,
    reviews: 126,
    phone: "+254 700 123 456",
    email: "jane.mbeki@example.com",
    office: "Nairobi • Westlands",
    avatarColor: "#0EA5E9"
  },
  {
    id: "BR-94821",
    name: "John Owusu",
    license: "LIC-AB-0088",
    approved: false,
    rating: 3.9,
    reviews: 64,
    phone: "+233 24 555 0198",
    email: "john.owusu@example.com",
    office: "Accra • Osu",
    avatarColor: "#F97316"
  },
  {
    id: "BR-55671",
    name: "Amina Diallo",
    license: "LIC-AB-0215",
    approved: true,
    rating: 4.5,
    reviews: 89,
    phone: "+221 77 987 6543",
    email: "amina.diallo@example.com",
    office: "Dakar • Plateau",
    avatarColor: "#22C55E"
  }
];

export type MockScan = {
  id: string;
  at: string; // ISO timestamp
  status: "verified" | "warning" | "invalid";
  broker?: MockBroker;
};

// Synthetic scan data - removed in production
// Rely on real endpoints that return []
export const MOCK_SCANS: MockScan[] = (() => {
  if (process.env.NODE_ENV === 'production' || process.env.EXPO_PUBLIC_ENABLE_MOCKS !== 'true') {
    return []; // Production: empty array, mocks disabled
  }
  // Development with mocks enabled: use mock data
  const brokers = MOCK_BROKERS;
  return [
    { id: "S-0007", at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), status: "verified" as const, broker: brokers[0] },
    { id: "S-0006", at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), status: "warning" as const, broker: brokers[1] },
    { id: "S-0005", at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: "invalid" as const },
    { id: "S-0004", at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), status: "verified" as const, broker: brokers[2] },
    { id: "S-0003", at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), status: "verified" as const, broker: brokers[0] }
  ];
})();

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function statusColor(status: "verified" | "warning" | "invalid"): string {
  switch (status) {
    case "verified":
      return "#16A34A";
    case "warning":
      return "#F59E0B";
    default:
      return "#EF4444";
  }
}
