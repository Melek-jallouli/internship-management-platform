import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-stagiaire-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './stagiaire-layout.component.html'
})
export class StagiaireLayoutComponent {
  private authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}