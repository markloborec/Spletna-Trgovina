import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { UserProfileComponent } from './settings/user-profile/user-profile';
import { KolesaComponent } from './kolesa/kolesa.component';
import { KontaktComponent } from './kontakt/kontakt.component';

export const routes: Routes = [
    { path: '', component: Homepage },
    { path: 'settings/user-profile', component: UserProfileComponent },
    { path: 'kolesa', component: KolesaComponent },

    { path: 'kontakt', component: KontaktComponent },
];
