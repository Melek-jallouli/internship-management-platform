import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EntretienService } from './entretien.service';


@Component({
  selector: 'app-reunion-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './entretien-form.component.html'
})
export class EntretienFormComponent {
  private fb = inject(FormBuilder);
  private reunionService = inject(EntretienService);

  reunionForm: FormGroup = this.fb.group({
    titre: ['', Validators.required],
    dateDebut: ['', Validators.required],
    duree: [30, Validators.required],
    pfeId: ['', Validators.required] // Tu peux transformer ça en <select> plus tard
  });
  
  @Output() reunionCreated = new EventEmitter<void>();
  onSubmit() {
    if (this.reunionForm.valid) {
      // Génération automatique d'un nom de salle unique
      const roomName = `PFE-MEET-${Math.random().toString(36).substring(7)}`;
      const payload = { ...this.reunionForm.value, roomName };

      this.reunionService.schedule(payload).subscribe({
        next: () => {
          alert('Réunion planifiée avec succès !');
          this.reunionForm.reset({ duree: 30 });
        },
        error: (err) => console.error('Erreur lors de la planification', err)
      });
    }
  }
}