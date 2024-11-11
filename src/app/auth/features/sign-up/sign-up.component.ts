import { AuthService } from './../../../services/auth.service';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { User } from '../../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: 'sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {}

  form = this.formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    username: new FormControl('', Validators.required)
  });

  async submit() {
    if (this.form.valid) {
      const { email, password, username } = this.form.value;
      const user: User = {
        email: email!,
        password: password!,
        username: username!
      };

      try {
        // Llama a signUp de AuthService y espera el resultado
        await this.authService.signUp(user);
        console.log('Usuario registrado y guardado en Firestore');

        // Redirige al usuario a la página de inicio o perfil después del registro
        this.router.navigate(['/home']);
      } catch (error) {
        console.error('Error en el registro:', error);
      }
    }
  }
}
