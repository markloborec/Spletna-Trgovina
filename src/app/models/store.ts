export interface Store {
  city: string;
  address: string;
  phone: string;
  manager: string;
  workingHours: string[];
  location: { lat: number; lng: number };
  notice?: string;
  imageUrl?: string;
}
