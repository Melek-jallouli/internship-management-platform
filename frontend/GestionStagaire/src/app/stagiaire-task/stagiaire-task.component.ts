import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Task, TaskService } from '../task/task.service';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stagiaire-task',
  imports: [DatePipe,FormsModule],
  templateUrl: './stagiaire-task.component.html',
  styleUrl: './stagiaire-task.component.css',
})

export class InternTasksComponent implements OnInit {
  private taskService = inject(TaskService);
  private PlatformId = inject(PLATFORM_ID);
  tasks = signal<Task[]>([]);

  ngOnInit() {
    if (isPlatformBrowser(this.PlatformId)) {
      this.loadTasks();
    }
  }

  loadTasks() {
    this.taskService.getMyTasks().subscribe(data => this.tasks.set(data));
  }

  changeStatus(taskId: number, status: any) {
    this.taskService.updateStatus(taskId, status).subscribe(() => {
      // Optionnel : rafraîchir ou mettre à jour le signal localement
      this.tasks.update(ts => ts.map(t => t.id_task === taskId ? { ...t, statut: status } : t));
    });
  }
  
  getPriorityClass(priority: string) {
  switch (priority) {
    case 'HAUTE': return 'bg-red-100 text-red-600';
    case 'MOYENNE': return 'bg-amber-100 text-amber-600';
    case 'BASSE': return 'bg-emerald-100 text-emerald-600';
    default: return 'bg-slate-100 text-slate-600';
  }
}

}
