import { Component, OnInit } from '@angular/core';

/**
 * Home Component
 * Landing page with welcome message and basic information
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  headerText = 'Management System';
  subText = 'Government of Manipur';
  aboutText = 'The Management System (RCCMS) is an online platform designed to streamline and digitize the management of revenue court cases in Manipur. Citizens can track their cases, access documents, submit applications, and stay updated on case proceedings. The system provides transparency, efficiency, and easy access to case-related information for both citizens and court operators.';
  activeUsers = 1250; // Active users count - can be fetched from API

  constructor() { }

  ngOnInit(): void {
    // Component initialization logic can be added here
    // TODO: Fetch active users count from API
  }
}

