export interface UserProfile {
    id?: string;

    firstName: string;
    lastName: string;
    email: string;

    deliveryAddress: string;
    phone: string;
}

export interface RegisterRequest extends UserProfile {
    password: string;
    confirmPassword?: string;
}
