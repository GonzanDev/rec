import { hasEmailError, isRequired } from './../../utils/validators';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { toast } from 'ngx-sonner';
import { RouterLink, Router } from '@angular/router';
import { GoogleButtonComponent } from '../../ui/google-button/google-button.component';


interface FormSignUp {
  email: FormControl<string | null >;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GoogleButtonComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export  class SignUpComponent {
 private _formBuilder = inject(FormBuilder);
 private authService = inject(AuthService);
 private _router = inject(Router);


 isRequired(field: 'email' | 'password'){
  return isRequired(field, this.form);
 }

 hasEmailError() {
  return hasEmailError(this.form);
 }

 form = this._formBuilder.group({
  email: this._formBuilder.control('',
    [Validators.required,
     Validators.email
  ]),
  password:this._formBuilder.control('', Validators.required)
 })

 async submit(){
  if(this.form.invalid) return;

  try{
  const {email, password} = this.form.value;

  if(!email || !password) return ;

  console.log({email, password});
  await this.authService.signUp({email, password});
    toast.success('Usuario creado correctamente.');
    this._router.navigateByUrl('home');
 }catch(error){
    toast.error('Ocurrio un error.')
 }
 }

 async submitWithGoogle(){
  try{
    await this.authService.signInWithGoogle();
    toast.success('Usuario creado correctamente.');
    this._router.navigateByUrl('/home')
  }catch(error){
    toast.error('Ocurrio un error.')
  }
 }

}
