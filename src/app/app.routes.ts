import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { HomeComponent } from './home/home.component';
import { CanActivateGuard } from './can-activate.guard';
import { TeamComponent } from './team/team.component';
import { CheckupComponent } from './checkup/checkup.component';
import { JoinTeamComponent } from './join-team/join-team.component';
import { PresentationComponent } from './presentation/presentation.component';
import { NewPresentationComponent } from './new-presentation/new-presentation.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'profile', component: UserProfileComponent, canActivate: [CanActivateGuard] },
    { path: 'profile/:userId', component: UserProfileComponent, canActivate: [CanActivateGuard] },
    { path: 'team/:teamId', component: TeamComponent, canActivate: [CanActivateGuard] },
    { path: 'invite/:teamId', component: JoinTeamComponent, canActivate: [CanActivateGuard] },
    { path: 'new-presentation/:teamId/:presentationId', component: NewPresentationComponent },
    { path: 'presentation/:teamId/:presentationId', component: PresentationComponent },
    { path: 'checkup/:presentationId', component: CheckupComponent },
    { path: '', component: HomeComponent },
];
