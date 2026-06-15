export const AVAILABLE_TAGS = [
  'VIP',
  'Repeat',
  'New Customer',
  'High Risk',
  'Do Not Rent',
  'Referral',
  'Influencer',
  'Corporate',
  'Friend/Family',
  'Music Video',
  'Event Rental',
] as const

export type CustomerTag = (typeof AVAILABLE_TAGS)[number]
