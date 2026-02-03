import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Guards
import { AuthGuard } from '../core/guards/auth.guard';

// Components
import { LawyerHomeComponent } from './lawyer-home/lawyer-home.component';
import { SharedModule } from '../shared/shared.module';

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
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class LawyerModule { }
