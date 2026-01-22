import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';

// Components
import { RegistrationComponent } from './registration/registration.component';
import { LawyerRegistrationComponent } from './registration/lawyer-registration/lawyer-registration.component';
import { DynamicRegistrationFormComponent } from './registration/dynamic-registration-form/dynamic-registration-form.component';

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
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatRadioModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-IN' }
  ]
})
export class RegistrationModule { }

