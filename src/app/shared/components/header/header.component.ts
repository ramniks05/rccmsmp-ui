import { Component } from '@angular/core';

/**
 * Header Component
 * Top navigation bar with application title
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  appTitle = 'RCCMS';
  fullTitle = 'Government of Manipur';
}

