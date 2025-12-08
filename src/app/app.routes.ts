import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { UserProfileComponent } from './settings/user-profile/user-profile';
import { Bikes } from './bikes/bikes';
import { Clothes } from './clothes/clothes';
import { Equipments } from './equipments/equipments';
import { Contact } from './contact/contact';

export const routes: Routes = [
    { path: '', component: Homepage },
    { path: 'settings/user-profile', component: UserProfileComponent },
    { path: 'bikes', component: Bikes },
    { path: 'equipment', component: Equipments },
    { path: 'clothes', component: Clothes},
    { path: 'contact', component: Contact}
];
