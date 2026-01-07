import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

// Page Components
import { HomeComponent } from './home/home.component';

/**
 * Routes for Pages Module
 */
const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  }
];

/**
 * Pages Module
 * Contains all page-level components
 */
@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule
  ]
})
export class PagesModule { }

