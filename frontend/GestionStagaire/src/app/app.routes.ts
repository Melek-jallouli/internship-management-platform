import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { CvManagerComponent } from './cv-manager/cv-manager.component';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { RegisterComponent } from './register/register.component';
import { CvDeployComponent } from './cv-deploy/cv-deploy.component';
import { ProjectsListComponent } from './project-list/project-list.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { PfeListComponent } from './pfe-list/pfe-list.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { StagiaireLayoutComponent } from './stagiaire-layout/stagiaire-layout.component';
import { VideoCallComponent } from './video-call/video-call.component';
import { ChatComponent } from './chat/chat.component';
import { AddProjectComponent } from './add-project/add-project.component';
import { EncadrantLayoutComponent } from './encadrant-layout/encadrant-layout.component';
import { EncadrantDashboardComponent } from './encadrant-dashboard/encadrant-dashboard.component';
import { TaskComponent } from './task/task.component';
import { InternTasksComponent } from './stagiaire-task/stagiaire-task.component';
import { ChatBotComponent } from './chat-bot/chat-bot.component';
import { PfeStatsComponent } from './pfe-stats/pfe-stats.component';
import { ProfilComponent } from './profil/profil.component';
import { RankingComponent } from './ranking/ranking.component';

export const routes: Routes = [

  // 🔓 Public
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // 🎥 Meeting
  {
    path: 'meeting/:roomName',
    component: VideoCallComponent,
    canActivate: [authGuard]
  },

  // 👨‍🎓 STAGIAIRE
  {
    path: 'stagiaire',
    component: StagiaireLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: ['STAGIAIRE'] },
    children: [
      { path: '', component: DashboardComponent }, // 🔥 IMPORTANT
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profil', component: ProfilComponent },
      { path: 'cv-deploy', component: CvDeployComponent },
      { path: 'projets', component: ProjectsListComponent },
      { path: 'task', component: InternTasksComponent },
      { path: 'messages', component: ChatComponent }
    ]
  },

  {
    path: 'encadrant',
    component: EncadrantLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: ['ENCADRANT_PRO', 'ENCADRANT_ACAD'] },
    children: [
      { path: '', component: EncadrantDashboardComponent }, // 🔥 IMPORTANT
      { path: 'dashboard', component: EncadrantDashboardComponent },
      { path: 'tasks', component: TaskComponent },
      { path: 'chat', component: ChatComponent }
    ]
  },

  // 🛠 ADMIN
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: ['ADMIN'] },
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'pfe-list', component: PfeListComponent },
      { path: 'add-project', component: AddProjectComponent },
      { path: 'cv-management', component: CvManagerComponent },
      { path: 'ranking', component: RankingComponent },
      { path: 'chatBot', component: ChatBotComponent }
    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];