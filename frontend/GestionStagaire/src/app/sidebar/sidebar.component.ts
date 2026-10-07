import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule], // Indispensable pour la navigation
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  userRole: string | null = '';

  constructor() {
    // On récupère le rôle stocké lors du login (ou décodé du JWT)
    this.userRole = localStorage.getItem('userRole'); 
  }
}