import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // Importation indispensable
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Utilisateur } from '../pfe-list/pfe-list.component';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID); // Injection de l'ID de plateforme
  private cdr = inject(ChangeDetectorRef); // Injection du ChangeDetector pour forcer la détection de changements après les requêtes HTTP

  users = signal<Utilisateur[]>([]);
  selectedUser = signal<Utilisateur | null>(null);
  showModal = false;
  chargement = false; // Pour un feedback visuel
  
  newUser = {
    firstName: '',
    lastName: '',
    email: '',
    specialty: 'Développement Web'
  };

  ngOnInit() {
    // On ne charge les données que si on est dans le navigateur
    if (isPlatformBrowser(this.platformId)) {
      this.loadUsers();
    }
  }

  loadUsers() {
    this.chargement = true;
    this.http.get<Utilisateur[]>('http://localhost:3000/users').subscribe({
      next: (data) => {
        this.users.set(data);
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement users:', err);
        this.chargement = false;
      }
    });
  }

  openAddModal() {
    this.showModal = true;
  }

  saveUser() {
    // Cette méthode est déclenchée par un clic, donc on est forcément 
    // côté navigateur, mais c'est une bonne habitude de rester prudent.
    this.http.post('http://localhost:3000/users', this.newUser).subscribe({
      next: (res) => {
        this.showModal = false;
        this.loadUsers(); // Rafraîchir la liste
        this.resetForm();
      },
      error: (err) => alert("Erreur lors de l'ajout")
    });
  }

  deleteUser(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.http.delete(`http://localhost:3000/users/${id}`).subscribe({
        next: () => {
          // Mettre à jour la liste localement après suppression
          this.users.update(prev => prev.filter(u => u.id_utilisateur !== id));
          console.log('Utilisateur supprimé');
        },
        error: (err) => console.error('Erreur lors de la suppression', err)
      });
    }
  }

  // Fonction pour modifier (ouvre souvent une modal ou redirige)
  editUser(user: Utilisateur) {
    this.selectedUser.set({ ...user }); 
  }

  // Ferme la modal
  closeModal() {
    this.selectedUser.set(null);
  }

  // Envoie les modifications au backend
  updateUser() {
    const user = this.selectedUser();
    if (!user) return;

    this.http.put<Utilisateur>(`http://localhost:3000/users/${user.id_utilisateur}`, user).subscribe({
      next: (updatedUser) => {
        // Mise à jour locale du signal pour éviter de rafraîchir toute la page
        this.users.update(list => 
          list.map(u => u.id_utilisateur === user.id_utilisateur ? updatedUser : u)
        );
        this.closeModal();
      },
      error: (err) => console.error('Erreur MAJ:', err)
    });
  }

  resetForm() {
    this.newUser = { firstName: '', lastName: '', email: '', specialty: 'Développement Web' };
  }
}