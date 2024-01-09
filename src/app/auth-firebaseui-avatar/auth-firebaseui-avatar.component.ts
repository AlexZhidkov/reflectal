import { Component, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Auth, User, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { Router } from "@angular/router";

export interface LinkMenuItem {
  text: string;
  icon?: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback?: Function;
}

@Component({
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatButtonModule, MatTooltipModule, MatIconModule],
  selector: "auth-firebaseui-avatar",
  templateUrl: "./auth-firebaseui-avatar.component.html",
  styleUrls: ["./auth-firebaseui-avatar.component.scss"],
})
export class AuthFirebaseuiAvatarComponent implements OnInit {
  @Input()
  layout: "default" | "simple" = "default";

  @Input()
  canLogout = true;

  @Input()
  links: LinkMenuItem[] = [];

  @Input()
  canViewAccount = true;

  @Input()
  canDeleteAccount = true;

  @Input()
  canEditAccount = true;

  @Input()
  textProfile = "Profile";

  @Input()
  textSignOut = "Sign Out";

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output()
  onSignOut: EventEmitter<void> = new EventEmitter();

  private auth: Auth = inject(Auth);
  user: User | null = null;
  displayNameInitials: string | null = null;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        return;
      }
      this.user = user;
      this.displayNameInitials = user.displayName ? this.getDisplayNameInitials(user.displayName)
        : user.email ? user.email[0].toUpperCase() : null;
    });
  }

  openProfile() {
    console.log("openProfile");
  }

  getDisplayNameInitials(displayName: string | null): string | null {
    if (!displayName) {
      return null;
    }
    const initialsRegExp: RegExpMatchArray = displayName.match(/\b\w/g) || [''];
    const initials = (
      (initialsRegExp.shift() || "") + (initialsRegExp.pop() || "")
    ).toUpperCase();
    return initials;
  }

  convertAnonymousToPermanentAccount() {
    this.router.navigate([`/login`]);
  }

  async signOut() {
    try {
      await signOut(this.auth);
      // Sign-out successful.
      this.onSignOut.emit();
    } catch (e) {
      // An error happened.
      console.error("An error happened while signing out!", e);
    }
  }
}
