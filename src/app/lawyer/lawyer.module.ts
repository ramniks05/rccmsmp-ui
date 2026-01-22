import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Guards
import { AuthGuard } from '../core/guards/auth.guard';

// Components
import { LawyerHomeComponent } from './lawyer-home/lawyer-home.component';

/**
 * Routes for Lawyer Module
 */
const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: LawyerHomeComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Lawyer Home' }
  }
];

/**
 * Lawyer Module
 * Handles lawyer-specific features and pages
 */
@NgModule({
  declarations: [
    LawyerHomeComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class LawyerModule { }
