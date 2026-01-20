import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

// Components
import { CitizenHomeComponent } from './citizen-home/citizen-home.component';
import { LandProcessTypesComponent } from './land-process-types/land-process-types.component';
import { SharedModule } from '../shared/shared.module';
import { MutationGiftSalesComponent } from './mutation-gift-sales/mutation-gift-sales.component';
import { ServicesLayoutComponent } from './services-layout/services-layout.component';

/**
 * Routes for Citizen Module
 */

const routes: Routes = [
  {
    path: '',
    component: CitizenHomeComponent,
    data: { breadcrumb: 'Home' }
  },
  {
    path: 'home',
    component: CitizenHomeComponent,
    data: { breadcrumb: 'Home' }
  },
  {
    path: 'services',
    data: { breadcrumb: 'Land Services' },
    component: ServicesLayoutComponent,
    children: [
      {
        path: '',
        component: LandProcessTypesComponent,
        data: { breadcrumb: 'Home' },
      },
      {
        path: 'mutation-gift-sales',
        component: MutationGiftSalesComponent,
        data: { breadcrumb: 'Mutation / Gift / Sales' }
      }
    ]
  }
];

/**
 * Citizen Module
 * Handles all citizen-related pages and features
 */
@NgModule({
  declarations: [
    CitizenHomeComponent,
    LandProcessTypesComponent,
    MutationGiftSalesComponent,
    ServicesLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    SharedModule
  ]
})
export class CitizenModule { }

