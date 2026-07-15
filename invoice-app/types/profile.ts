export interface Profile {
  id: string;
  isPremium: boolean;
  stripeCustomerId: string | null;
}
