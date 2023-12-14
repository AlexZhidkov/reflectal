import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { AuthFirebaseuiAvatarComponent, LinkMenuItem } from './auth-firebaseui-avatar/auth-firebaseui-avatar.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, AuthFirebaseuiAvatarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private auth: Auth = inject(Auth);
  private analytics: Analytics = inject(Analytics);
  showSignInButton: boolean = false;

  avatarLinks: LinkMenuItem[] = [
    { icon: 'account_circle', text: `Profile`, callback: () => { this.router.navigate(['profile']); } },
    { icon: 'info', text: `About the app`, callback: () => { this.router.navigate(['about']); } },
    {
      icon: 'mail', text: `Contact the developer`, callback: () => {
        logEvent(this.analytics, 'email_developer');
        window.open('mailto:azhidkov@gmail.com?subject=Reflectal%20App&body=Hi%20Alex,%20Love%20your%20app!');
      }
    },
  ];

  constructor(private router: Router) { }

  async ngOnInit(): Promise<void> {
    onAuthStateChanged(this.auth, (user) => {
      this.showSignInButton = Boolean(!user);
    });
  }

  onSignOut(): void {
    logEvent(this.analytics, 'user_signed_out');
    this.router.navigate(['/']).then(() => location.reload());
  }
}
