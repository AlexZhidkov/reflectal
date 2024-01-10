import { User } from "@angular/fire/auth";

export interface AppUser extends User {
    uid: string;
    role?: string;
    org: string;
    orgs: string[];
}
