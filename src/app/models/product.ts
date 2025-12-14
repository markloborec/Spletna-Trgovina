export type ProductType = 'cycles' | 'equipment' | 'clothing';

export interface Product {
    id: string;                        // ali number če ID ni GUID
    name: string;
    price: number;
    imageUrl: string;
    shortDescription: string;
    longDescription: string;
    type: ProductType;
    isAvailable: boolean;
    warrantyMonths: number;
    officialProductSite?: string;
}

export interface Bicycle extends Product {
    wheelSize: number;
    frameMaterial: string;
    gearCount: number;
}

export interface Clothing extends Product {
    size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
    gender?: 'male' | 'female' | 'unisex';
    material?: string;
    color?: string;
}

export interface Equipment extends Product {
    compatibility: string[];   // imena modelov / tipi (npr. MTB, Road)
    weight?: number;           // v gramih
    material?: string;         // npr. Aluminum, Carbon
    brand?: string;
}
