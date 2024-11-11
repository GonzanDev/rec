
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterModule,

} from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule

import {NgxSonnerToaster} from 'ngx-sonner';
import { AuthStateService } from './auth/data-access/auth-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    FormsModule, // Add FormsModule here
    NgxSonnerToaster
  ],
  standalone: true,
})
export class AppComponent implements OnInit {
  constructor(private authStateService: AuthStateService) {}

  ngOnInit(): void {
    this.authStateService.initAuthStateListener();
  }
}
