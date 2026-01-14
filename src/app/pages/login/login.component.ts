import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * Login Component
 * Handles login for both Citizens and Operators
 * Supports both OTP and Username/Password authentication
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  selectedTab = 0; // 0 = Citizen, 1 = Operator
  loginMethod = 'mobile'; // 'mobile' or 'password'
  
  mobileLoginForm: FormGroup;
  passwordLoginForm: FormGroup;
  
  captchaText = '';
  passwordCaptchaText = '';
  captchaId = ''; // Store CAPTCHA ID for verification
  passwordCaptchaId = '';
  showOtpFieldForMobile = true;
  showCaptchaField = true;
  otpSent = false;
  isSendingOtp = false;
  isLoggingIn = false;
  isPasswordLoggingIn = false;
  otpErrorMessage = '';
  otpSuccessMessage = '';
  loginErrorMessage = '';
  loginSuccessMessage = '';
  passwordLoginErrorMessage = '';
  passwordLoginSuccessMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    // Mobile Login Form with OTP and CAPTCHA
    this.mobileLoginForm = this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      otp: [''],
      captcha: ['', [Validators.required]]
    });

    // Password Login Form (Mobile/Email & Password)
    this.passwordLoginForm = this.fb.group({
      username: ['', [Validators.required, this.mobileOrEmailValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      captcha: ['', [Validators.required]]
    });

    // Generate initial CAPTCHAs using API
    this.refreshCaptcha();
    this.refreshPasswordCaptcha();
  }

  /**
   * Switch between Citizen and Operator tabs
   */
  onTabChange(index: number): void {
    this.selectedTab = index;
    this.loginMethod = 'mobile';
    this.otpSent = false;
    this.otpErrorMessage = '';
    this.otpSuccessMessage = '';
    this.resetForms();
  }

  /**
   * Switch between Mobile and Password login methods
   */
  onLoginMethodChange(method: string): void {
    this.loginMethod = method;
    if (method === 'mobile') {
      this.showOtpFieldForMobile = true;
      this.showCaptchaField = true;
      this.otpSent = false;
      this.mobileLoginForm.patchValue({ otp: '', captcha: '' });
      this.mobileLoginForm.get('otp')?.clearValidators();
      this.mobileLoginForm.get('otp')?.updateValueAndValidity();
      this.refreshCaptcha();
    } else if (method === 'password') {
      this.passwordLoginForm.patchValue({ captcha: '' });
      this.refreshPasswordCaptcha();
    }
  }

  /**
   * Custom validator for mobile number or email
   */
  mobileOrEmailValidator = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const value = control.value.trim();
    
    // Check if it's a valid 10-digit mobile number
    const mobilePattern = /^[6-9]\d{9}$/;
    if (mobilePattern.test(value)) {
      return null;
    }
    
    // Check if it's a valid email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(value)) {
      return null;
    }
    
    // If neither mobile nor email, return error
    return { invalid: true };
  }

  /**
   * Generate and refresh CAPTCHA for mobile login using API
   */
  refreshCaptcha(): void {
    this.apiService.generateCaptcha()
      .pipe(
        catchError(error => {
          console.error('Failed to generate CAPTCHA:', error);
          // Fallback to client-side generation if API fails
          this.generateCaptchaFallback(true);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          const captchaData = response?.data || response;
          if (captchaData?.captchaId && captchaData?.captchaText) {
            this.captchaId = captchaData.captchaId;
            this.captchaText = captchaData.captchaText;
            // Clear captcha input when refreshed
            if (this.showCaptchaField) {
              this.mobileLoginForm.patchValue({ captcha: '' });
            }
          } else {
            // Fallback if response format is unexpected
            this.generateCaptchaFallback(true);
          }
        },
        error: (error) => {
          // Error already handled in catchError with fallback
        }
      });
  }

  /**
   * Generate and refresh CAPTCHA for password login using API
   */
  refreshPasswordCaptcha(): void {
    this.apiService.generateCaptcha()
      .pipe(
        catchError(error => {
          console.error('Failed to generate CAPTCHA:', error);
          // Fallback to client-side generation if API fails
          this.generateCaptchaFallback(false);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          const captchaData = response?.data || response;
          if (captchaData?.captchaId && captchaData?.captchaText) {
            this.passwordCaptchaId = captchaData.captchaId;
            this.passwordCaptchaText = captchaData.captchaText;
            // Clear captcha input when refreshed
            this.passwordLoginForm.patchValue({ captcha: '' });
          } else {
            // Fallback if response format is unexpected
            this.generateCaptchaFallback(false);
          }
        },
        error: (error) => {
          // Error already handled in catchError with fallback
        }
      });
  }

  /**
   * Fallback method to generate CAPTCHA client-side if API fails
   */
  private generateCaptchaFallback(isMobile: boolean): void {
    // Generate a random 6-character CAPTCHA
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Generate UUID for CAPTCHA ID
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    if (isMobile) {
      this.captchaText = result;
      this.captchaId = uuid;
      if (this.showCaptchaField) {
        this.mobileLoginForm.patchValue({ captcha: '' });
      }
    } else {
      this.passwordCaptchaText = result;
      this.passwordCaptchaId = uuid;
      this.passwordLoginForm.patchValue({ captcha: '' });
    }
  }



  /**
   * Send OTP button click handler
   */
  onSendOtp(): void {
    if (this.mobileLoginForm.get('mobile')?.valid) {
      const mobileNumber = this.mobileLoginForm.get('mobile')?.value;
      const userType = this.selectedTab === 0 ? 'CITIZEN' : 'OPERATOR';
      
      this.isSendingOtp = true;
      this.otpErrorMessage = '';
      this.otpSuccessMessage = '';
      
      this.apiService.sendOTP(mobileNumber, userType)
        .pipe(
          catchError(error => {
            this.isSendingOtp = false;
            this.handleOtpError(error);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            this.isSendingOtp = false;
            this.handleOtpSuccess(response, mobileNumber);
          },
          error: (error) => {
            // Error already handled in catchError
            this.isSendingOtp = false;
          }
        });
    } else {
      this.mobileLoginForm.get('mobile')?.markAsTouched();
    }
  }

  /**
   * Handle successful OTP sending
   */
  private handleOtpSuccess(response: any, mobileNumber: string): void {
    console.log('OTP sent successfully:', response);
    this.otpSent = true;
    this.otpSuccessMessage = `OTP has been sent to your mobile number: ${mobileNumber}`;
    
    // Enable OTP field validation
    this.mobileLoginForm.get('otp')?.setValidators([Validators.required, Validators.pattern(/^\d{6}$/)]);
    this.mobileLoginForm.get('otp')?.updateValueAndValidity();
    
    // Clear OTP and CAPTCHA fields
    this.mobileLoginForm.patchValue({ otp: '', captcha: '' });
    this.refreshCaptcha();
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      this.otpSuccessMessage = '';
    }, 5000);
  }

  /**
   * Handle OTP sending errors
   */
  private handleOtpError(error: any): void {
    console.error('Send OTP error:', error);
    
    if (error.error) {
      if (error.error.message) {
        this.otpErrorMessage = error.error.message;
      } else if (error.error.error) {
        this.otpErrorMessage = error.error.error;
      } else {
        this.otpErrorMessage = 'Failed to send OTP. Please try again.';
      }
    } else if (error.status === 0) {
      this.otpErrorMessage = 'Unable to connect to server. Please check your connection.';
    } else if (error.status === 404) {
      this.otpErrorMessage = 'Mobile number not registered. Please register first.';
    } else if (error.status === 429) {
      this.otpErrorMessage = 'Too many OTP requests. Please wait before requesting again.';
    } else if (error.status === 400) {
      this.otpErrorMessage = 'Invalid mobile number or user type.';
    } else {
      this.otpErrorMessage = 'Failed to send OTP. Please try again later.';
    }
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      this.otpErrorMessage = '';
    }, 5000);
  }

  /**
   * Handle Mobile Login with OTP and CAPTCHA
   */
  onMobileLogin(): void {
    if (this.mobileLoginForm.valid) {
      // Basic validation
      const captchaValue = this.mobileLoginForm.get('captcha')?.value?.toUpperCase();
      if (!captchaValue || captchaValue.length !== this.captchaText.length) {
        this.mobileLoginForm.get('captcha')?.setErrors({ invalid: true });
        this.loginErrorMessage = 'Please enter the CAPTCHA value.';
        setTimeout(() => {
          this.loginErrorMessage = '';
        }, 3000);
        return;
      }

      if (!this.otpSent) {
        this.loginErrorMessage = 'Please send OTP first.';
        setTimeout(() => {
          this.loginErrorMessage = '';
        }, 3000);
        return;
      }

      if (!this.captchaId) {
        this.loginErrorMessage = 'CAPTCHA not loaded. Please refresh the page.';
        this.refreshCaptcha();
        setTimeout(() => {
          this.loginErrorMessage = '';
        }, 3000);
        return;
      }

      const mobileNumber = this.mobileLoginForm.get('mobile')?.value;
      const otp = this.mobileLoginForm.get('otp')?.value;
      const captcha = this.mobileLoginForm.get('captcha')?.value?.toUpperCase();
      const userType = this.selectedTab === 0 ? 'CITIZEN' : 'OPERATOR';

      this.isLoggingIn = true;
      this.loginErrorMessage = '';
      this.loginSuccessMessage = '';

      // Validate CAPTCHA first (optional pre-validation)
      this.validateCaptchaAndLogin(mobileNumber, otp || '', captcha, this.captchaId, userType, true);
    } else {
      this.markFormGroupTouched(this.mobileLoginForm);
    }
  }

  /**
   * Validate CAPTCHA and proceed with login
   */
  private validateCaptchaAndLogin(
    identifier: string, // mobileNumber for mobile login, username for password login
    credential: string, // otp for mobile login, password for password login
    captcha: string, 
    captchaId: string, 
    userType: string,
    isMobileLogin: boolean
  ): void {
    // Optional: Pre-validate CAPTCHA before login
    // Note: CAPTCHA is also validated on server during login, but this provides early feedback
    this.apiService.validateCaptcha(captchaId, captcha)
      .pipe(
        catchError(error => {
          // If validation API fails, proceed with login anyway (server will validate)
          console.warn('CAPTCHA validation API failed, proceeding with login:', error);
          this.proceedWithLogin(identifier, credential, captcha, captchaId, userType, isMobileLogin);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          const isValid = response?.data?.valid !== false && response?.valid !== false;
          if (isValid === false || (response?.data?.valid === false) || (response?.valid === false)) {
            if (isMobileLogin) {
              this.isLoggingIn = false;
              this.loginErrorMessage = 'Invalid CAPTCHA. Please try again.';
              this.mobileLoginForm.get('captcha')?.setErrors({ invalid: true });
              this.refreshCaptcha();
              setTimeout(() => {
                this.loginErrorMessage = '';
              }, 3000);
            } else {
              this.isPasswordLoggingIn = false;
              this.passwordLoginErrorMessage = 'Invalid CAPTCHA. Please try again.';
              this.passwordLoginForm.get('captcha')?.setErrors({ invalid: true });
              this.refreshPasswordCaptcha();
              setTimeout(() => {
                this.passwordLoginErrorMessage = '';
              }, 3000);
            }
          } else {
            // CAPTCHA is valid, proceed with login
            this.proceedWithLogin(identifier, credential, captcha, captchaId, userType, isMobileLogin);
          }
        },
        error: (error) => {
          // Proceed with login even if validation API fails (server will validate)
          this.proceedWithLogin(identifier, credential, captcha, captchaId, userType, isMobileLogin);
        }
      });
  }

  /**
   * Proceed with actual login after CAPTCHA validation
   */
  private proceedWithLogin(
    identifier: string, // mobileNumber for mobile login, username for password login
    credential: string, // otp for mobile login, password for password login
    captcha: string, 
    captchaId: string, 
    userType: string,
    isMobileLogin: boolean
  ): void {
    if (isMobileLogin) {
      // Mobile login with OTP
      this.apiService.verifyOTP(identifier, credential, captcha, captchaId, userType)
        .pipe(
          catchError(error => {
            this.isLoggingIn = false;
            this.handleLoginError(error);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            this.isLoggingIn = false;
            this.handleLoginSuccess(response);
          },
          error: (error) => {
            // Error already handled in catchError
            this.isLoggingIn = false;
          }
        });
    } else {
      // Password login
      this.apiService.passwordLogin(identifier, credential, captcha, captchaId, userType)
        .pipe(
          catchError(error => {
            this.isPasswordLoggingIn = false;
            this.handlePasswordLoginError(error);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            this.isPasswordLoggingIn = false;
            this.handlePasswordLoginSuccess(response);
          },
          error: (error) => {
            // Error already handled in catchError
            this.isPasswordLoggingIn = false;
          }
        });
    }
  }

  /**
   * Handle successful login
   */
  private handleLoginSuccess(response: any): void {
    console.log('Login successful:', response);
    
    // Extract token and user data from response
    const token = response?.token || response?.data?.token;
    const refreshToken = response?.refreshToken || response?.data?.refreshToken;
    const userType = response?.userType || response?.data?.userType || 'CITIZEN';
    const userData = {
      userId: response?.userId || response?.data?.userId,
      userType: userType,
      email: response?.email || response?.data?.email,
      mobileNumber: response?.mobileNumber || response?.data?.mobileNumber,
      firstName: response?.firstName || response?.data?.firstName,
      lastName: response?.lastName || response?.data?.lastName,
      name: response?.name || response?.data?.name,
      expiresIn: response?.expiresIn || response?.data?.expiresIn
    };

    if (token) {
      // Store authentication data
      this.authService.setAuthData(token, refreshToken || '', userData);
      
      this.loginSuccessMessage = 'Login successful! Redirecting...';
      
      // Redirect based on user type
      setTimeout(() => {
        if (userType === 'CITIZEN' || this.selectedTab === 0) {
          this.router.navigate(['/citizen/home']);
        } else {
          // For operators, redirect to operator dashboard (to be implemented)
          this.router.navigate(['/home']);
        }
      }, 1500);
    } else {
      this.loginErrorMessage = 'Invalid response from server. Please try again.';
      setTimeout(() => {
        this.loginErrorMessage = '';
      }, 5000);
    }
  }

  /**
   * Handle login errors
   */
  private handleLoginError(error: any): void {
    console.error('Login error:', error);
    
    if (error.error) {
      if (error.error.message) {
        this.loginErrorMessage = error.error.message;
      } else if (error.error.error) {
        this.loginErrorMessage = error.error.error;
      } else {
        this.loginErrorMessage = 'Login failed. Please check your credentials and try again.';
      }
    } else if (error.status === 0) {
      this.loginErrorMessage = 'Unable to connect to server. Please check your connection.';
    } else if (error.status === 401) {
      this.loginErrorMessage = 'Invalid OTP or CAPTCHA. Please try again.';
      // Clear OTP field and refresh CAPTCHA
      this.mobileLoginForm.patchValue({ otp: '', captcha: '' });
      this.refreshCaptcha();
    } else if (error.status === 400) {
      this.loginErrorMessage = 'Invalid data. Please check all fields and try again.';
    } else if (error.status === 404) {
      this.loginErrorMessage = 'User not found. Please register first.';
    } else {
      this.loginErrorMessage = 'An error occurred during login. Please try again later.';
    }
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      this.loginErrorMessage = '';
    }, 5000);
  }

  /**
   * Handle Password Login
   */
  onPasswordLogin(): void {
    if (this.passwordLoginForm.valid) {
      // Basic validation
      const captchaValue = this.passwordLoginForm.get('captcha')?.value?.toUpperCase();
      if (!captchaValue || captchaValue.length !== this.passwordCaptchaText.length) {
        this.passwordLoginForm.get('captcha')?.setErrors({ invalid: true });
        this.passwordLoginErrorMessage = 'Please enter the CAPTCHA value.';
        setTimeout(() => {
          this.passwordLoginErrorMessage = '';
        }, 3000);
        return;
      }

      if (!this.passwordCaptchaId) {
        this.passwordLoginErrorMessage = 'CAPTCHA not loaded. Please refresh the page.';
        this.refreshPasswordCaptcha();
        setTimeout(() => {
          this.passwordLoginErrorMessage = '';
        }, 3000);
        return;
      }

      const username = this.passwordLoginForm.get('username')?.value;
      const password = this.passwordLoginForm.get('password')?.value;
      const captcha = this.passwordLoginForm.get('captcha')?.value?.toUpperCase();
      const userType = this.selectedTab === 0 ? 'CITIZEN' : 'OPERATOR';

      this.isPasswordLoggingIn = true;
      this.passwordLoginErrorMessage = '';
      this.passwordLoginSuccessMessage = '';

      // Validate CAPTCHA first (optional pre-validation)
      this.validateCaptchaAndLogin(username, password, captcha, this.passwordCaptchaId, userType, false);
    } else {
      this.markFormGroupTouched(this.passwordLoginForm);
    }
  }

  /**
   * Handle successful password login
   */
  private handlePasswordLoginSuccess(response: any): void {
    console.log('Password login successful:', response);
    
    // Extract token and user data from response (same as mobile login)
    const token = response?.token || response?.data?.token;
    const refreshToken = response?.refreshToken || response?.data?.refreshToken;
    const userType = response?.userType || response?.data?.userType || 'CITIZEN';
    const userData = {
      userId: response?.userId || response?.data?.userId,
      userType: userType,
      email: response?.email || response?.data?.email,
      mobileNumber: response?.mobileNumber || response?.data?.mobileNumber,
      firstName: response?.firstName || response?.data?.firstName,
      lastName: response?.lastName || response?.data?.lastName,
      name: response?.name || response?.data?.name,
      expiresIn: response?.expiresIn || response?.data?.expiresIn
    };

    if (token) {
      // Store authentication data
      this.authService.setAuthData(token, refreshToken || '', userData);
      
      this.passwordLoginSuccessMessage = 'Login successful! Redirecting...';
      
      // Redirect based on user type
      setTimeout(() => {
        if (userType === 'CITIZEN' || this.selectedTab === 0) {
          this.router.navigate(['/citizen/home']);
        } else {
          // For operators, redirect to operator dashboard (to be implemented)
          this.router.navigate(['/home']);
        }
      }, 1500);
    } else {
      this.passwordLoginErrorMessage = 'Invalid response from server. Please try again.';
      setTimeout(() => {
        this.passwordLoginErrorMessage = '';
      }, 5000);
    }
  }

  /**
   * Handle password login errors
   */
  private handlePasswordLoginError(error: any): void {
    console.error('Password login error:', error);
    
    if (error.error) {
      if (error.error.message) {
        this.passwordLoginErrorMessage = error.error.message;
      } else if (error.error.error) {
        this.passwordLoginErrorMessage = error.error.error;
      } else {
        this.passwordLoginErrorMessage = 'Login failed. Please check your credentials and try again.';
      }
    } else if (error.status === 0) {
      this.passwordLoginErrorMessage = 'Unable to connect to server. Please check your connection.';
    } else if (error.status === 401) {
      this.passwordLoginErrorMessage = 'Invalid username, password, or CAPTCHA. Please try again.';
      // Clear password and CAPTCHA fields, refresh CAPTCHA
      this.passwordLoginForm.patchValue({ password: '', captcha: '' });
      this.refreshPasswordCaptcha();
    } else if (error.status === 400) {
      this.passwordLoginErrorMessage = 'Invalid data. Please check all fields and try again.';
    } else if (error.status === 403) {
      this.passwordLoginErrorMessage = 'Account not active or not verified. Please contact support.';
    } else if (error.status === 404) {
      this.passwordLoginErrorMessage = 'User not found. Please register first.';
    } else {
      this.passwordLoginErrorMessage = 'An error occurred during login. Please try again later.';
    }
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      this.passwordLoginErrorMessage = '';
    }, 5000);
  }

  /**
   * Reset all forms
   */
  private resetForms(): void {
    this.mobileLoginForm.reset();
    this.passwordLoginForm.reset();
    this.showOtpFieldForMobile = true;
    this.showCaptchaField = true;
    this.otpSent = false;
    this.isSendingOtp = false;
    this.isLoggingIn = false;
    this.isPasswordLoggingIn = false;
    this.otpErrorMessage = '';
    this.otpSuccessMessage = '';
    this.loginErrorMessage = '';
    this.loginSuccessMessage = '';
    this.passwordLoginErrorMessage = '';
    this.passwordLoginSuccessMessage = '';
    this.mobileLoginForm.get('otp')?.clearValidators();
    this.mobileLoginForm.get('otp')?.updateValueAndValidity();
    this.refreshCaptcha();
    this.refreshPasswordCaptcha();
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

}

