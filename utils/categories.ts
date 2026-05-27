/** All allowed service categories (sync with backend) */
export const CATEGORIES = [
    "Cleaning",
    "Repairs",
    "Plumbing",
    "Electrical",
    "Painting",
    "Gardening",
    "Tutoring",
    "Beauty & Spa",
    "Catering",
    "Shopping",
    "Photography",
    "IT Support",
  ] as const;
  
  export type Category = (typeof CATEGORIES)[number];  