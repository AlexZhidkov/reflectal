import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppUser } from '../models/app-user';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-join-org',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressBarModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './join-org.component.html',
  styleUrl: './join-org.component.scss'
})
export class JoinOrgComponent {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  orgId: string;
  orgName: string = '';
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
  ) {
    const orgId = this.route.snapshot.paramMap.get('orgId');
    if (!orgId) throw new Error("Org ID is falsy");
    this.orgId = orgId;

    getDoc(doc(this.firestore, 'orgs', this.orgId)).then(async (org) => {
      this.orgName = org.data()?.['name'];
      const user = (await getDoc(doc(this.firestore, 'users', this.auth.currentUser!.uid))).data() as AppUser;
      if (!user) throw new Error("User object is falsy.");
      user.orgs.push(org.id);
      updateDoc(doc(this.firestore, 'users', this.auth.currentUser!.uid), {
        org: org.id,
        orgs: user.orgs
      }).then(() => {
        this.isLoading = false;
      });
    });
  }
}
