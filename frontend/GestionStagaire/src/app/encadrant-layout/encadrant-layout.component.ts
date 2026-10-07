import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-encadrant-layout',
  imports: [RouterModule],
  templateUrl: './encadrant-layout.component.html',
  styleUrl: './encadrant-layout.component.css',
})
export class EncadrantLayoutComponent {
   private authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}
