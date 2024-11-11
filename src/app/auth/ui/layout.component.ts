import { Component, inject } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { AuthStateService } from "../data-access/auth-state.service";

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [RouterOutlet],
  template:`
  <button (click)="logOut()">Salir</button>
  <router-outlet />
  `,
})
export class LayoutComponent{

  private router = inject(Router);
  private authState = inject(AuthStateService);
  async logOut(){
    await this.authState.logOut();
    this.router.navigateByUrl('/auth/sign-in');
  }

}
