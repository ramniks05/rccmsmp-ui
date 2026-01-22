import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

/**
 * Lawyer Home Component
 * Welcome page for lawyers after login
 */
@Component({
  selector: 'app-lawyer-home',
  templateUrl: './lawyer-home.component.html',
  styleUrls: ['./lawyer-home.component.scss']
})
export class LawyerHomeComponent implements OnInit {
  userData: any = null;
  userName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get user data from auth service
    this.userData = this.authService.getUserData();

    // Check if user is authenticated
    if (!this.authService.isAuthenticated() || !this.userData) {
      // Redirect to login if not authenticated
      this.router.navigate(['/home']);
      return;
    }

    // Extract user name from user data
    if (this.userData.firstName) {
      this.userName = this.userData.firstName;
      if (this.userData.lastName) {
        this.userName += ' ' + this.userData.lastName;
      }
    } else if (this.userData.name) {
      this.userName = this.userData.name;
    } else if (this.userData.mobileNumber) {
      this.userName = 'Lawyer ' + this.userData.mobileNumber.slice(-4);
    } else {
      this.userName = 'Lawyer';
    }
  }

  /**
   * Navigate to lawyer profile
   */
  myProfile(): void {
    this.router.navigate(['/lawyer/my-profile']);
  }

  /**
   * Navigate to lawyer cases
   */
  myCases(): void {
    this.router.navigate(['/lawyer/my-cases']);
  }

  /**
   * Logout user
   */
  logout(): void {
    this.authService.sendData(null);
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
