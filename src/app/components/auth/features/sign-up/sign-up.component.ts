import { AuthService } from '../../../../services/auth.service';
import { Component, inject, NgZone } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../../../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { toast } from 'ngx-sonner';

import { hasEmailError, isRequired } from './../../utils/validators';
import { GoogleButtonComponent } from '../../ui/google-button/google-button.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink, GoogleButtonComponent],
  templateUrl: 'sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private zone = inject(NgZone);

  constructor() {}

  form = this.formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    username: new FormControl('', Validators.required),
  });

async submit() {
  if (this.form.valid) {
    const { email, password, username } = this.form.value;
    const user: User = {
      email: email!,
      password: password!,
      username: username!,
    };

    try {
      // 1. Esperamos a que termine el registro y Firestore
      await this.authService.signUp(user);
      
      // 2. Notificamos al usuario
      toast.success('Usuario registrado correctamente');

      // 3. Forzamos la redirección dentro de la zona de Angular
      // Esto soluciona que se quede "colgado"
      this.zone.run(() => {
        this.router.navigate(['/home']);
      });

    } catch (error: any) {
      console.error('Error en el registro:', error);
      // Un toque extra: mostrar el error real de Firebase (ej: email ya en uso)
      toast.error(error.message || 'Hubo un problema al crear tu cuenta');
    }
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
    console.error('Google sign in error:', error);
    toast.error('Ocurrió un error.');
  }
}
}
