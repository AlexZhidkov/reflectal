import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, addDoc, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AppUser } from '../models/app-user';

@Component({
  selector: 'app-new-organisation',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatInputModule, MatFormFieldModule, MatIconModule, MatButtonModule],
  templateUrl: './new-organisation.component.html',
  styleUrl: './new-organisation.component.scss'
})
export class NewOrganisationComponent {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  name: string = '';
  description: string = '';

  constructor(
    private router: Router,
  ) { }

  create() {
    if (!this.auth.currentUser) throw new Error("User is not logged in.");

    addDoc(collection(this.firestore, 'orgs'), {
      name: this.name,
      description: this.description,
      owner: this.auth.currentUser.uid
    }).then(async (org) => {
      const user = (await getDoc(doc(this.firestore, 'users', this.auth.currentUser!.uid))).data() as AppUser;
      if (!user) throw new Error("User object is falsy.");
      user.orgs.push(org.id);
      updateDoc(doc(this.firestore, 'users', this.auth.currentUser!.uid), {
        org: org.id,
        orgs: user.orgs
      }).then(() => {
        this.router.navigate(['/']);
      });
    });
  }
}
