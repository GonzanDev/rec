import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, filter, take } from 'rxjs';
import { toast } from 'ngx-sonner';
import { AuthStateService } from '../../components/auth/data-access/auth-state.service';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css'],
})
export class SettingsPageComponent implements OnInit, OnDestroy {
  private authState = inject(AuthStateService);
  private userService = inject(UserService);
  private router = inject(Router);

  private subscriptions: Subscription[] = [];

  userId: string = '';
  user: User | null = null;
  isLoading: boolean = true;
  isSaving: boolean = false;
  isUploadingAvatar: boolean = false;

  username: string = '';
  bio: string = '';
  isPrivate: boolean = false;

  ngOnInit() {
    const sub = this.authState.authState$
      .pipe(
        filter((auth) => auth !== undefined),
        take(1)
      )
      .subscribe((authState) => {
        if (!authState) {
          this.router.navigateByUrl('/auth/sign-in');
          return;
        }
        this.userId = authState.uid;
        this.loadProfile();
      });
    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private loadProfile() {
    const sub = this.userService.getUserProfile(this.userId).pipe(take(1)).subscribe({
      next: (user) => {
        this.user = user;
        this.username = user?.username || '';
        this.bio = user?.bio || '';
        this.isPrivate = !!user?.isPrivate;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
        this.isLoading = false;
        toast.error('No se pudo cargar tu perfil');
      },
    });
    this.subscriptions.push(sub);
  }

  async onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede pesar más de 5MB');
      return;
    }

    this.isUploadingAvatar = true;
    try {
      const photoURL = await this.userService.uploadAvatar(this.userId, file);
      this.user = { ...(this.user as User), photoURL };
      toast.success('Foto de perfil actualizada');
    } catch (error) {
      console.error('Error al subir la foto de perfil:', error);
      toast.error('Error al subir la foto de perfil');
    } finally {
      this.isUploadingAvatar = false;
      input.value = '';
    }
  }

  async save() {
    const username = this.username.trim();
    if (!username) {
      toast.error('El nombre de usuario no puede estar vacío');
      return;
    }

    this.isSaving = true;
    try {
      await this.userService.updateProfile(this.userId, {
        username,
        bio: this.bio.trim(),
        isPrivate: this.isPrivate,
      });
      toast.success('Cambios guardados');
      this.router.navigate(['/users', this.userId]);
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      this.isSaving = false;
    }
  }
}
