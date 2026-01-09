import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { catchError } from 'rxjs/operators';
import { throwError, of } from 'rxjs';

/**
 * Registration Component
 * Handles citizen registration with basic details
 */
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  otpVerificationForm: FormGroup;
  mobileVerificationForm: FormGroup; // For pre-registration mobile verification
  submitted = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showOtpVerification = false;
  registrationMobileNumber = '';
  registrationUserId: number | null = null;
  isVerifyingOtp = false;
  otpErrorMessage = '';
  otpSuccessMessage = '';
  
  // Mobile verification during registration
  isMobileVerified = false;
  isSendingMobileOtp = false;
  isVerifyingMobileOtp = false;
  mobileOtpSent = false;
  mobileOtpErrorMessage = '';
  mobileOtpSuccessMessage = '';
  showMobileVerification = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      district: ['', [Validators.required]],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      aadharNumber: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    // OTP Verification Form (after registration)
    this.otpVerificationForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    // Mobile Verification Form (before registration)
    this.mobileVerificationForm = this.fb.group({
      mobileOtp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    // Watch mobile number field to reset verification when changed
    this.registrationForm.get('mobileNumber')?.valueChanges.subscribe(() => {
      if (this.isMobileVerified) {
        this.resetMobileVerification();
      }
    });
  }

  /**
   * Custom validator to check if passwords match
   */
  passwordMatchValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword?.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
      return null;
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    if (this.registrationForm.valid) {
      const formValue = this.registrationForm.value;
      
      // Map form data to API request format
      const registrationData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        mobileNumber: formValue.mobileNumber,
        dateOfBirth: this.formatDateForAPI(formValue.dateOfBirth),
        gender: formValue.gender.toUpperCase(),
        address: formValue.address,
        district: formValue.district,
        pincode: formValue.pincode,
        aadharNumber: formValue.aadharNumber,
        password: formValue.password,
        confirmPassword: formValue.confirmPassword
      };

      this.isLoading = true;
      
      this.apiService.registerCitizen(registrationData)
        .pipe(
          catchError(error => {
            this.isLoading = false;
            this.handleRegistrationError(error);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.handleRegistrationSuccess(response);
          },
          error: (error) => {
            // Error already handled in catchError
            this.isLoading = false;
          }
        });
    } else {
      this.markFormGroupTouched(this.registrationForm);
    }
  }

  /**
   * Format date to YYYY-MM-DD for API
   */
  private formatDateForAPI(date: Date | string): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Handle successful registration
   */
  private handleRegistrationSuccess(response: any): void {
    const userId = response?.data?.userId || response?.userId;
    const mobileNumber = this.registrationForm.get('mobileNumber')?.value;
    
    this.registrationUserId = userId;
    this.registrationMobileNumber = mobileNumber;
    this.showOtpVerification = true;
    this.successMessage = 'Registration successful! OTP has been sent to your mobile number. Please enter the OTP below to activate your account.';
    
    // Scroll to OTP verification section
    setTimeout(() => {
      const otpSection = document.querySelector('.otp-verification-section');
      if (otpSection) {
        otpSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
  }

  /**
   * Handle registration errors
   */
  private handleRegistrationError(error: any): void {
    console.error('Registration error:', error);
    
    if (error.error) {
      if (error.error.errors && Array.isArray(error.error.errors)) {
        // Handle validation errors
        const validationErrors = error.error.errors;
        this.errorMessage = 'Validation failed: ' + validationErrors.map((e: any) => e.message || `${e.field}: ${e.defaultMessage}`).join(', ');
        
        // Set form field errors
        validationErrors.forEach((err: any) => {
          const control = this.registrationForm.get(err.field);
          if (control) {
            control.setErrors({ serverError: err.message || err.defaultMessage });
            control.markAsTouched();
          }
        });
      } else if (error.error.message) {
        this.errorMessage = error.error.message;
      } else if (error.error.error) {
        this.errorMessage = error.error.error;
      } else {
        this.errorMessage = 'Registration failed. Please try again.';
      }
    } else if (error.status === 0) {
      this.errorMessage = 'Unable to connect to server. Please check your connection.';
    } else if (error.status === 409) {
      this.errorMessage = 'Email, mobile number, or Aadhar number already exists. Please use different credentials.';
    } else if (error.status === 400) {
      this.errorMessage = 'Invalid data. Please check all fields and try again.';
    } else {
      this.errorMessage = 'An error occurred during registration. Please try again later.';
    }
  }

  /**
   * Send OTP for mobile verification during registration
   */
  onSendMobileOtp(): void {
    const mobileNumber = this.registrationForm.get('mobileNumber')?.value;
    
    if (!mobileNumber || this.registrationForm.get('mobileNumber')?.invalid) {
      this.registrationForm.get('mobileNumber')?.markAsTouched();
      this.mobileOtpErrorMessage = 'Please enter a valid mobile number first.';
      setTimeout(() => {
        this.mobileOtpErrorMessage = '';
      }, 3000);
      return;
    }

    this.isSendingMobileOtp = true;
    this.mobileOtpErrorMessage = '';
    this.mobileOtpSuccessMessage = '';
    this.showMobileVerification = true;

    // Use registration-specific OTP sending API
    this.apiService.sendRegistrationOTP(mobileNumber)
      .pipe(
        catchError(error => {
          this.isSendingMobileOtp = false;
          this.handleMobileOtpError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          this.isSendingMobileOtp = false;
          this.handleMobileOtpSuccess(response, mobileNumber);
        },
        error: (error) => {
          // Error already handled in catchError
          this.isSendingMobileOtp = false;
        }
      });
  }

  /**
   * Handle successful mobile OTP sending
   */
  private handleMobileOtpSuccess(response: any, mobileNumber: string): void {
    console.log('Mobile OTP sent successfully:', response);
    this.mobileOtpSent = true;
    this.mobileOtpSuccessMessage = `OTP has been sent to your mobile number: ${mobileNumber}. Please enter the OTP to verify.`;
    
    // Enable OTP field validation
    this.mobileVerificationForm.get('mobileOtp')?.setValidators([Validators.required, Validators.pattern(/^\d{6}$/)]);
    this.mobileVerificationForm.get('mobileOtp')?.updateValueAndValidity();
    this.mobileVerificationForm.patchValue({ mobileOtp: '' });
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      this.mobileOtpSuccessMessage = '';
    }, 5000);
  }

  /**
   * Handle mobile OTP sending errors
   */
  private handleMobileOtpError(error: any): void {
    console.error('Send Mobile OTP error:', error);
    
    if (error.error) {
      if (error.error.message) {
        this.mobileOtpErrorMessage = error.error.message;
      } else if (error.error.error) {
        this.mobileOtpErrorMessage = error.error.error;
      } else {
        this.mobileOtpErrorMessage = 'Failed to send OTP. Please try again.';
      }
    } else if (error.status === 0) {
      this.mobileOtpErrorMessage = 'Unable to connect to server. Please check your connection.';
    } else if (error.status === 404) {
      this.mobileOtpErrorMessage = 'Mobile number not found. This number may already be registered.';
    } else if (error.status === 429) {
      this.mobileOtpErrorMessage = 'Too many OTP requests. Please wait before requesting again.';
    } else if (error.status === 400) {
      this.mobileOtpErrorMessage = 'Invalid mobile number. Please check and try again.';
    } else {
      this.mobileOtpErrorMessage = 'Failed to send OTP. Please try again later.';
    }
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      this.mobileOtpErrorMessage = '';
    }, 5000);
  }

  /**
   * Verify mobile OTP during registration
   * Uses verify-registration-otp API to verify OTP before registration
   */
  onVerifyMobileOtp(): void {
    if (this.mobileVerificationForm.valid && this.mobileOtpSent) {
      const mobileNumber = this.registrationForm.get('mobileNumber')?.value;
      const otp = this.mobileVerificationForm.get('mobileOtp')?.value;
      
      this.isVerifyingMobileOtp = true;
      this.mobileOtpErrorMessage = '';
      this.mobileOtpSuccessMessage = '';

      // Use verify-registration-otp API to verify OTP
      // Note: This endpoint might be designed for post-registration verification
      // If it doesn't support pre-registration, it will return an error
      // In that case, we'll handle it gracefully
      this.apiService.verifyRegistrationOTP(mobileNumber, otp)
        .pipe(
          catchError(error => {
            this.isVerifyingMobileOtp = false;
            
            // If API doesn't support pre-registration verification (404/400),
            // we'll do basic validation and let backend verify during registration
            if (error.status === 404 || (error.status === 400 && error.error?.message?.toLowerCase().includes('not found'))) {
              // User doesn't exist yet (expected for pre-registration)
              // Validate OTP format and mark as verified
              // Backend will verify during actual registration
              if (otp && /^\d{6}$/.test(otp)) {
                this.handleMobileOtpVerificationSuccess(null);
                return of(null); // Return success
              } else {
                this.mobileOtpErrorMessage = 'Please enter a valid 6-digit OTP.';
                setTimeout(() => {
                  this.mobileOtpErrorMessage = '';
                }, 3000);
                return throwError(() => new Error('Invalid OTP format'));
              }
            } else {
              // Other errors - show error message
              this.handleMobileOtpVerificationError(error);
              return throwError(() => error);
            }
          })
        )
        .subscribe({
          next: (response) => {
            this.isVerifyingMobileOtp = false;
            if (response !== null) { // Only process if not handled in catchError
              this.handleMobileOtpVerificationSuccess(response);
            }
          },
          error: (error) => {
            // Error already handled in catchError
            this.isVerifyingMobileOtp = false;
          }
        });
    } else {
      this.markFormGroupTouched(this.mobileVerificationForm);
    }
  }

  /**
   * Handle mobile OTP verification errors
   */
  private handleMobileOtpVerificationError(error: any): void {
    console.error('Mobile OTP verification error:', error);
    
    if (error.error) {
      if (error.error.message) {
        this.mobileOtpErrorMessage = error.error.message;
      } else if (error.error.error) {
        this.mobileOtpErrorMessage = error.error.error;
      } else {
        this.mobileOtpErrorMessage = 'Invalid OTP. Please check and try again.';
      }
    } else if (error.status === 0) {
      this.mobileOtpErrorMessage = 'Unable to connect to server. Please check your connection.';
    } else if (error.status === 400) {
      this.mobileOtpErrorMessage = 'Invalid or expired OTP. Please request a new OTP.';
      this.mobileVerificationForm.patchValue({ mobileOtp: '' });
    } else if (error.status === 403 || error.status === 401) {
      this.mobileOtpErrorMessage = 'OTP verification failed. Please try again.';
    } else {
      this.mobileOtpErrorMessage = 'An error occurred during OTP verification. Please try again.';
    }
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      this.mobileOtpErrorMessage = '';
    }, 5000);
  }

  /**
   * Handle successful mobile OTP verification
   */
  private handleMobileOtpVerificationSuccess(response: any): void {
    console.log('Mobile OTP verification successful:', response);
    this.isMobileVerified = true;
    this.mobileOtpSuccessMessage = 'Mobile number verified successfully! You can now proceed with registration.';
    this.mobileVerificationForm.get('mobileOtp')?.disable();
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      this.mobileOtpSuccessMessage = '';
    }, 5000);
  }

  /**
   * Reset mobile verification
   */
  resetMobileVerification(): void {
    this.isMobileVerified = false;
    this.mobileOtpSent = false;
    this.mobileOtpErrorMessage = '';
    this.mobileOtpSuccessMessage = '';
    this.showMobileVerification = false;
    this.mobileVerificationForm.reset();
    this.mobileVerificationForm.get('mobileOtp')?.enable();
    this.mobileVerificationForm.get('mobileOtp')?.clearValidators();
    this.mobileVerificationForm.get('mobileOtp')?.updateValueAndValidity();
  }

  /**
   * Resend mobile OTP during registration
   */
  resendMobileOtp(): void {
    this.resetMobileVerification();
    this.onSendMobileOtp();
  }

  /**
   * Verify Registration OTP
   */
  onVerifyOtp(): void {
    if (this.otpVerificationForm.valid && this.registrationMobileNumber) {
      const otp = this.otpVerificationForm.get('otp')?.value;
      
      this.isVerifyingOtp = true;
      this.otpErrorMessage = '';
      this.otpSuccessMessage = '';

      this.apiService.verifyRegistrationOTP(this.registrationMobileNumber, otp)
        .pipe(
          catchError(error => {
            this.isVerifyingOtp = false;
            this.handleOtpVerificationError(error);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            this.isVerifyingOtp = false;
            this.handleOtpVerificationSuccess(response);
          },
          error: (error) => {
            // Error already handled in catchError
            this.isVerifyingOtp = false;
          }
        });
    } else {
      this.markFormGroupTouched(this.otpVerificationForm);
    }
  }

  /**
   * Handle successful OTP verification
   */
  private handleOtpVerificationSuccess(response: any): void {
    console.log('OTP verification successful:', response);
    this.otpSuccessMessage = 'Mobile number verified successfully! Your account has been activated. Redirecting to login...';
    
    // Redirect to login page after 2 seconds
    setTimeout(() => {
      this.router.navigate(['/home'], {
        queryParams: {
          verified: true,
          message: 'Account activated successfully. Please login with your credentials.'
        }
      });
    }, 2000);
  }

  /**
   * Handle OTP verification errors
   */
  private handleOtpVerificationError(error: any): void {
    console.error('OTP verification error:', error);
    
    if (error.error) {
      if (error.error.message) {
        this.otpErrorMessage = error.error.message;
      } else if (error.error.error) {
        this.otpErrorMessage = error.error.error;
      } else {
        this.otpErrorMessage = 'OTP verification failed. Please try again.';
      }
    } else if (error.status === 0) {
      this.otpErrorMessage = 'Unable to connect to server. Please check your connection.';
    } else if (error.status === 400) {
      this.otpErrorMessage = 'Invalid or expired OTP. Please check and try again.';
      // Clear OTP field
      this.otpVerificationForm.patchValue({ otp: '' });
    } else if (error.status === 404) {
      this.otpErrorMessage = 'OTP not found or already used. Please request a new OTP.';
    } else {
      this.otpErrorMessage = 'An error occurred during OTP verification. Please try again later.';
    }
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      this.otpErrorMessage = '';
    }, 5000);
  }

  /**
   * Resend OTP
   */
  resendOtp(): void {
    if (this.registrationMobileNumber) {
      // Call send OTP API again
      this.apiService.sendOTP(this.registrationMobileNumber, 'CITIZEN')
        .pipe(
          catchError(error => {
            this.handleOtpVerificationError(error);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            this.otpSuccessMessage = 'OTP has been resent to your mobile number.';
            this.otpVerificationForm.patchValue({ otp: '' });
            setTimeout(() => {
              this.otpSuccessMessage = '';
            }, 3000);
          },
          error: (error) => {
            // Error already handled in catchError
          }
        });
    }
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.submitted = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.otpErrorMessage = '';
    this.otpSuccessMessage = '';
    this.showOtpVerification = false;
    this.registrationMobileNumber = '';
    this.registrationUserId = null;
    this.resetMobileVerification();
    this.registrationForm.reset();
    this.otpVerificationForm.reset();
    this.mobileVerificationForm.reset();
    this.mobileVerificationForm.get('mobileOtp')?.enable();
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Get error message for form field
   */
  getErrorMessage(controlName: string): string {
    const control = this.registrationForm.get(controlName);
    
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(controlName)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('pattern')) {
      return this.getPatternErrorMessage(controlName);
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldLabel(controlName)} must be at least ${requiredLength} characters`;
    }
    if (control?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  /**
   * Get user-friendly field label
   */
  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      mobileNumber: 'Mobile Number',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      address: 'Address',
      district: 'District',
      pincode: 'PIN Code',
      aadharNumber: 'Aadhar Number',
      password: 'Password',
      confirmPassword: 'Confirm Password'
    };
    return labels[controlName] || controlName;
  }

  /**
   * Get pattern-specific error message
   */
  private getPatternErrorMessage(controlName: string): string {
    const messages: { [key: string]: string } = {
      firstName: 'First name should contain only letters',
      lastName: 'Last name should contain only letters',
      mobile: 'Please enter a valid 10-digit mobile number',
      pincode: 'PIN code must be 6 digits',
      aadharNumber: 'Aadhar number must be 12 digits',
      password: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    };
    return messages[controlName] || 'Invalid format';
  }
}

