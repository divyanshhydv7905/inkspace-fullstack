export const SITE_CONFIG = {
  name: "InkSpace",
  tagline: "Minimalist Editorial Publishing & Human-Centered AI",
  colors: {
    warmIvory: "#FAF9F6",
    pureWhite: "#FFFFFF",
    primaryText: "#191919",
    secondaryText: "#77736E",
    border: "#E9E6E0",
    accentForest: "#2D4A3E",
  },
  pagination: {
    publicDefaultPageSize: 9,
    maxPageSize: 50,
    dashboardPageSize: 15,
  },
  aiLimits: {
    maxInputCharacters: 32000,
    requestTimeoutMs: 25000,
    rateLimitPerMinute: 10,
  },
} as const;
