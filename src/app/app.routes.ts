import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { HomeComponent } from './home/home.component';
import { CanActivateGuard } from './can-activate.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'profile', component: UserProfileComponent, canActivate: [CanActivateGuard] },
    { path: 'profile/:userId', component: UserProfileComponent, canActivate: [CanActivateGuard] },
    { path: '', component: HomeComponent },
];
