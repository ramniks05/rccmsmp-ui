import { Component } from '@angular/core';
import { FloatLabelType } from '@angular/material/form-field';
import { Router } from '@angular/router';

/**
 * Header Component
 * Top navigation bar with application title
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  appTitle = 'RCCMS';
  fullTitle = 'Government of Manipur';
}

  login(user: any) {
    this.router.navigate(['/auth'], { queryParams: { user: user } });
  }

  register() {
    this.router.navigate(['/auth/register']);
  }
}
