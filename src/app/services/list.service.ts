import { inject, Injectable } from '@angular/core';
import { Firestore, collection, docData, doc, setDoc, updateDoc, arrayUnion, arrayRemove, collectionData } from '@angular/fire/firestore';
import { addDoc, deleteDoc, deleteField, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ListItem {
  type: 'artist' | 'album' | 'song';
  id: string;
  addedAt: Timestamp;
}

export type ListPrivacy = 'public' | 'private';

export interface MusicList {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  tags: string[];
  privacy: ListPrivacy;
  ranked: boolean;
  items: ListItem[];
  likes?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const PATH = 'lists';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  private firestore = inject(Firestore);
  private lists = collection(this.firestore, PATH);

  create(list: Omit<MusicList, 'id'>) {
    // Firestore rejects `undefined` field values outright (e.g. an omitted description),
    // so drop them rather than writing them.
    const payload: any = {};
    for (const [key, value] of Object.entries(list)) {
      if (value !== undefined) payload[key] = value;
    }
    return addDoc(this.lists, payload);
  }

  getById(listId: string): Observable<MusicList> {
    const listDocRef = doc(this.firestore, `lists/${listId}`);
    return docData(listDocRef, { idField: 'id' }) as Observable<MusicList>;
  }

  /** All of a user's lists, public and private. Only ever call this for the signed-in user's own id. */
  getByUser(userId: string): Observable<MusicList[]> {
    const q = query(this.lists, where('userId', '==', userId), orderBy('updatedAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<MusicList[]>;
  }

  /**
   * A user's public lists only — safe to call for any profile, including someone else's.
   * No `orderBy` here: combining it with the two equality filters would need a composite
   * Firestore index, so we sort client-side instead.
   */
  getPublicByUser(userId: string): Observable<MusicList[]> {
    const q = query(this.lists, where('userId', '==', userId), where('privacy', '==', 'public'));
    return (collectionData(q, { idField: 'id' }) as Observable<MusicList[]>).pipe(
      map((lists) => [...lists].sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis()))
    );
  }

  /**
   * Latest public lists across all users. No `orderBy` here: combining it with
   * the privacy filter would need a composite index, so we sort client-side.
   */
  getLatestPublic(limit: number): Observable<MusicList[]> {
    const q = query(this.lists, where('privacy', '==', 'public'));
    return (collectionData(q, { idField: 'id' }) as Observable<MusicList[]>).pipe(
      map((lists) =>
        [...lists]
          .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
          .slice(0, limit)
      )
    );
  }

  update(listId: string, updatedList: Partial<MusicList>) {
    const listDocRef = doc(this.firestore, `lists/${listId}`);
    // Firestore rejects `undefined` field values; translate them into an explicit field
    // deletion instead (e.g. clearing the description), rather than dropping the key
    // (which would just skip updating it, and never clear it).
    const payload: any = { updatedAt: Timestamp.now() };
    for (const [key, value] of Object.entries(updatedList)) {
      payload[key] = value === undefined ? deleteField() : value;
    }
    return updateDoc(listDocRef, payload);
  }

  delete(listId: string) {
    const listDocRef = doc(this.firestore, `lists/${listId}`);
    return deleteDoc(listDocRef);
  }

  setItems(listId: string, items: ListItem[]) {
    const listDocRef = doc(this.firestore, `lists/${listId}`);
    return updateDoc(listDocRef, { items, updatedAt: Timestamp.now() });
  }

  addLike(listId: string, userId: string) {
    const listDocRef = doc(this.firestore, `lists/${listId}`);
    return updateDoc(listDocRef, {
      likes: arrayUnion(userId),
    });
  }

  removeLike(listId: string, userId: string) {
    const listDocRef = doc(this.firestore, `lists/${listId}`);
    return updateDoc(listDocRef, {
      likes: arrayRemove(userId),
    });
  }
}
