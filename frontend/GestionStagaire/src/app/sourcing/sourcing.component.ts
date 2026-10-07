import { Component, signal } from '@angular/core';
import { AiService } from '../chat-bot/ai.service';

@Component({
  selector: 'app-sourcing',
  templateUrl: './sourcing.component.html'
})
export class SourcingComponent {
  results = signal<any[]>([]);
  isAnalyzing = signal(false);

  constructor(private aiService: AiService) {}

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length === 0) return;

    this.isAnalyzing.set(true);
    this.results.set([]); // Reset

    Array.from(files).forEach(file => {
      this.aiService.filtrerCv(file, "Java Spring Angular SQL Docker").subscribe({
        next: (res) => {
          this.results.update(current => [...current, {
            nom: file.name,
            score: res.score,
            verdict: res.verdict,
            match: res.match
          }]);
        },
        complete: () => this.isAnalyzing.set(false)
      });
    });
  }
}