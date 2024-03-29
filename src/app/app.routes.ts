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
import { NewOrganisationComponent } from './new-organisation/new-organisation.component';
import { JoinOrgComponent } from './join-org/join-org.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'profile', component: UserProfileComponent, canActivate: [CanActivateGuard] },
    { path: 'org', component: NewOrganisationComponent, canActivate: [CanActivateGuard] },
    { path: 'profile/:userId', component: UserProfileComponent, canActivate: [CanActivateGuard] },
    { path: 'team/:orgId/:teamId', component: TeamComponent, canActivate: [CanActivateGuard] },
    { path: 'invite/:orgId', component: JoinOrgComponent, canActivate: [CanActivateGuard] },
    { path: 'invite/:orgId/:teamId', component: JoinTeamComponent, canActivate: [CanActivateGuard] },
    { path: 'new-presentation/:orgId/:teamId/:presentationId', component: NewPresentationComponent, canActivate: [CanActivateGuard] },
    { path: 'presentation/:orgId/:teamId/:presentationId', component: PresentationComponent, canActivate: [CanActivateGuard] },
    { path: 'checkup/:presentationId', component: CheckupComponent, canActivate: [CanActivateGuard] },
    { path: '', component: HomeComponent, canActivate: [CanActivateGuard] },
];
