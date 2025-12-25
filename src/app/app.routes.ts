import { Routes } from '@angular/router';
import { Homepage } from './components/content/homepage/homepage';
import { UserProfileComponent } from './components/content/user/user-profile/user-profile';
import { Bikes } from './components/content/bikes/bikes';
import { Clothes } from './components/content//clothes/clothes';
import { Equipments } from './components/content/equipments/equipments';
import { Contact } from './components/content/contact/contact';
import { Cart } from './components/content/cart/cart';
import { OrderHistory } from './components/content/user/order-history/order-history';

export const routes: Routes = [
    { path: '', component: Homepage },
    { path: 'settings/user-profile', component: UserProfileComponent },
    { path: 'bikes', component: Bikes },
    { path: 'equipment', component: Equipments },
    { path: 'clothes', component: Clothes},
    { path: 'contact', component: Contact},
    { path: 'cart', component: Cart },
    { path: 'orderHistory', component: OrderHistory}
];
