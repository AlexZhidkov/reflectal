import { Component, inject } from '@angular/core';
import { Auth, AuthProvider, FacebookAuthProvider, GoogleAuthProvider, OAuthProvider, User, createUserWithEmailAndPassword, sendPasswordResetEmail, signInAnonymously, signInWithEmailAndPassword, signInWithPopup, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Analytics, logEvent, setUserId } from '@angular/fire/analytics';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AppUser } from '../models/app-user';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatIconModule, MatCardModule, MatDividerModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private auth: Auth = inject(Auth);
  private analytics: Analytics = inject(Analytics)
  private firestore: Firestore = inject(Firestore);
  public name: string = '';
  public email: string = '';
  public password: string = '';
  public passwordInputType: string = 'password';
  public isSignUp: boolean = false;
  public isNewEmailAccount: boolean = false;
  public isResetPassword: boolean = false;

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.iconRegistry
      .addSvgIcon('google', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/mdi/google.svg'))
      .addSvgIcon('facebook', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/mdi/facebook.svg'))
      .addSvgIcon('microsoft', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/mdi/microsoft.svg'));
  }

  loginWithProvider(providerName: 'google' | 'facebook' | 'microsoft'): void {
    var provider: AuthProvider;
    switch (providerName) {
      case 'google': provider = new GoogleAuthProvider(); break;
      case 'facebook': provider = new FacebookAuthProvider(); break;
      case 'microsoft': provider = new OAuthProvider('microsoft.com'); break;
    }
    signInWithPopup(this.auth, provider).then((result) => {
      const user = result.user;
      this.onSuccess(user);
    }).catch((error) => {
      console.log(error);
      //ToDo: Show error message in toast
      console.log(error.message);
    });
  }

  continueAnonymously() {
    signInAnonymously(this.auth).then((userCredential) => {
      const user = userCredential.user;
      this.onSuccess(user);
    }).catch((error) => {
      console.log(error);
      //ToDo: Show error message in toast
      console.log(error.message);
    });
  }

  signUpWithPassword() {
    createUserWithEmailAndPassword(this.auth, this.email, this.password).then((userCredential) => {
      const user = userCredential.user;
      updateProfile(user, { displayName: this.name });
      this.onSuccess(user);
    }).catch((error) => {
      console.log(error);
      //ToDo: Show error message in toast
      console.log(error.message);
    });
  }

  signInWithPassword() {
    signInWithEmailAndPassword(this.auth, this.email, this.password).then((userCredential) => {
      const user = userCredential.user;
      this.onSuccess(user);
    }).catch((error) => {
      console.log(error);
      //ToDo: Show error message in toast
      this.snackBar.open(error.message, 'OK', {
        duration: 5000
      });
    });
  }

  /**
   * Reset the password via email
   * @param email - the email to reset
   */
  public resetPassword() {
    const message = "Password reset email sent. Check your inbox.";
    console.log(message);
    this.snackBar.open(message, 'OK', {
      duration: 5000
    });
    sendPasswordResetEmail(this.auth, this.email);
    this.isResetPassword = false;
  }

  onSuccess(user: User): void {
    setUserId(this.analytics, user.uid);
    logEvent(this.analytics, 'login', { uid: user.uid, providerId: user.providerData[0]?.providerId })
    const dbUserRef = doc(this.firestore, 'users', user.uid);
    getDoc(dbUserRef).then(async (doc) => {
      if (doc.exists()) {
        const dbUser = doc.data() as AppUser;
        if (!dbUser.photoURL) {
          await updateDoc(dbUserRef, { photoURL: user.photoURL });
        }
      } else {
        await setDoc(dbUserRef, {
          uid: user.uid,
          displayName: user.displayName ?? this.name,
          email: user.email ?? this.email,
          photoURL: user.photoURL,
          org: 'DEMO',
          orgs: ['DEMO'],
        });
      }
      this.route.queryParams.subscribe(params => {
        const redirectUrl = params['redirectUrl'];
        if (redirectUrl) {
          this.router.navigate([`${redirectUrl}`]);
        } else {
          this.router.navigate([`/`]);
        }
      });
    });
  }
}