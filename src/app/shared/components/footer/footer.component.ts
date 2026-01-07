import { Component } from '@angular/core';

/**
 * Footer Component
 * Application footer with copyright and organization information
 */
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  footerText = 'NIC | Government of Manipur';
}

