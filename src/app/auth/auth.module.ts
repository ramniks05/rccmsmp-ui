import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SharedModule } from '../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { CitizenRegistrationComponent } from './citizen-registration/citizen-registration.component';

@NgModule({
  declarations: [
    LoginComponent,
    CitizenRegistrationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }

