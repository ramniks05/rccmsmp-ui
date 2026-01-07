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
  headerText = 'Revenue Court Case Monitoring System';
  subText = 'Government of Manipur';
  welcomeMessage = 'Welcome to the Revenue Court Case Monitoring System. This platform helps manage and monitor court cases efficiently.';

  constructor() { }

  ngOnInit(): void {
    // Component initialization logic can be added here
  }
}

