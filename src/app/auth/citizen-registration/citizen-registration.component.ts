import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-citizen-registration',
  templateUrl: './citizen-registration.component.html',
  styleUrls: ['./citizen-registration.component.scss']
})
export class CitizenRegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  hidePassword = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      fullName: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      emailId: ['', [Validators.required, Validators.email]],
      districtCode: ['', Validators.required],
      address: ['', Validators.required],
      aadhaarNumber: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      password: ['', Validators.required],
    });
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  register(): void {
    if (this.registrationForm.valid) {
      console.log('Citizen Registration Data:', this.registrationForm.value);
      // Call your API here
    }
  }
}
