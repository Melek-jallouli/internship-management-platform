import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

interface RankingMetrics {
  task_score: number;
  supervisor_score: number;
  timing_score: number;
  tasks_total: number;
  tasks_done: number;
  tasks_in_progress: number;
  evaluation_submitted: boolean;
}

interface RankingData {
  stagiaire_id: number;
  final_score: number;
  rank: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
  metrics: RankingMetrics;
}

@Component({
  imports: [CommonModule],
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit, OnDestroy {
  rankings: RankingData[] = [];
  isLoading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.fetchRankings(); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  fetchRankings(): void {
    this.isLoading = true;
    this.error = null;

    this.http.get<RankingData[]>('http://localhost:8000/rankings/all')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => { this.rankings = data; this.isLoading = false; },
        error: (err)  => { this.error = 'Erreur lors du chargement du classement.'; this.isLoading = false; console.error(err); }
      });
  }

  getRankBadgeClass(rank: RankingData['rank']): string {
    const map: Record<RankingData['rank'], string> = {
      'S+': 'badge-sp', 'S': 'badge-s', 'A': 'badge-a',
      'B': 'badge-b',   'C': 'badge-c', 'D': 'badge-d'
    };
    return map[rank] ?? '';
  }

  getBarWidth(score: number, max: number): string {
    return ((score / max) * 100).toFixed(1) + '%';
  }
}