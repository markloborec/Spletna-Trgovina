import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { UserProfileComponent } from './settings/user-profile/user-profile';

export const routes: Routes = [
    { path: '', component: Homepage },
    { path: 'settings/user-profile', component: UserProfileComponent },
];
