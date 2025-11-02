export const colors = {
  brand: {
    primary: "#184C8C",
    accent: "#16A34A",
    warning: "#F59E0B",
    danger: "#EF4444"
  },
  fg: {
    strong: "#0F172A",
    default: "#1F2937",
    muted: "#334155"
  },
  bg: {
    page: "#F8FAFC",
    card: "#FFFFFF",
    subtle: "#F1F5F9"
  },
  border: "#E2E8F0"
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24
};

export const shadow = {
  card: {
    shadowColor: colors.brand.primary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  }
};
