export interface Store {
    id?: string;
    city: string;
    address: string;
    phone: string;
    manager: string;
    workingHours: string[];
    location: {              // lokacija za mapo
        lat: number;
        lng: number;
    };
}