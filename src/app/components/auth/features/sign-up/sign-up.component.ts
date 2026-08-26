import { AuthService } from '../../../../services/auth.service';
import { Component, inject, NgZone, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';

import { hasEmailError, hasMinLengthError, isRequired } from './../../utils/validators';
import { GoogleButtonComponent } from '../../ui/google-button/google-button.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GoogleButtonComponent],
  templateUrl: 'sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private zone = inject(NgZone);

  showPassword = signal(false);
  isLoading = signal(false);

  togglePassword() {
    this.showPassword.update((value) => !value);
  }

  isRequired(field: 'email' | 'password' | 'username') {
    return isRequired(field, this.form);
  }

  hasEmailError() {
    return hasEmailError(this.form);
  }

  hasMinLengthError() {
    return hasMinLengthError(this.form);
  }

  form = this.formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    username: new FormControl('', Validators.required),
  });

async submit() {
  if (this.form.invalid || this.isLoading()) return;

  const { email, password, username } = this.form.value;

  this.isLoading.set(true);
  try {
    // 1. Esperamos a que termine el registro y Firestore
    await this.authService.signUp({
      email: email!,
      password: password!,
      username: username!,
    });

    // 2. Notificamos al usuario
    toast.success('Usuario registrado correctamente');

    // 3. Forzamos la redirección dentro de la zona de Angular
    // Esto soluciona que se quede "colgado"
    this.zone.run(() => {
      this.router.navigate(['/home']);
    });

  } catch (error: any) {
    // Un toque extra: mostrar el error real de Firebase (ej: email ya en uso)
    toast.error(error.message || 'Hubo un problema al crear tu cuenta');
  } finally {
    this.isLoading.set(false);
  }
}

async submitWithGoogle() {
  try {
    await this.authService.signInWithGoogle();
    toast.success('Bienvenido');

    // Forzamos a Angular a navegar inmediatamente
    this.zone.run(() => {
      this.router.navigate(['/home']);
    });
  } catch (error) {
    toast.error('Ocurrió un error.');
  }
}
}
