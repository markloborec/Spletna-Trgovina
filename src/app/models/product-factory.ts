import { Bicycle, Clothing, Equipment, Product } from './product';

export class ProductFactory {
    static create(data: Product): Bicycle | Equipment | Clothing {
        switch (data.type) {
            case 'cycles':
                return data as Bicycle;
            case 'equipment':
                return data as Equipment;
            case 'clothing':
                return data as Clothing;
            default: {
                const neverType: never = data.type;
                throw new Error(`Unknown product type: ${neverType}`);
            }
        }
    }
}
