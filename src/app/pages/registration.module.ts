import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MAT_DATE_LOCALE } from '@angular/material/core';

// Components
import { RegistrationComponent } from './registration/registration.component';
import { LawyerRegistrationComponent } from './registration/lawyer-registration/lawyer-registration.component';
import { DynamicRegistrationFormComponent } from './registration/dynamic-registration-form/dynamic-registration-form.component';
import { SharedModule } from '../shared/shared.module';

/**
 * Routes for Registration Module
 */
const routes: Routes = [
  {
    path: '',
    component: RegistrationComponent,
    data: { breadcrumb: 'Citizen Registration' }
  },
  {
    path: 'lawyer',
    component: LawyerRegistrationComponent,
    data: { breadcrumb: 'Lawyer Registration' }
  }
];

/**
 * Registration Module
 * Handles the /registration route as a separate page
 */
@NgModule({
  declarations: [
    RegistrationComponent,
    LawyerRegistrationComponent,
    DynamicRegistrationFormComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-IN' }
  ]
})
export class RegistrationModule { }

