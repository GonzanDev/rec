import { inject, Injectable } from "@angular/core";
import { Firestore, collection } from "@angular/fire/firestore";
import { addDoc } from "firebase/firestore";

export interface User{
  id?: string,
  email: string,
  password: string,
  username?: string,
  favoriteAlbums?: string[],
  favoriteArtists?: string[],
  followers?: string[],
  following?: string[],
}

const PATH = 'users'

@Injectable({
providedIn: 'root',
})

export class UserService{
  private firestore = inject(Firestore);

  private users = collection(this.firestore, PATH);

  create(user: User){
    return addDoc(this.users, user)
  }

}

