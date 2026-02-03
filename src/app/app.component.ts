import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  showHeader: boolean = false;
  showBreadCrumbs: boolean = false;
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const hiddenRoutes = ['/home', '/error'];
        this.showHeader = !hiddenRoutes.includes(event.urlAfterRedirects);
        const hiddenBreadRoutes = ['/home', '/admin/home'];
        this.showBreadCrumbs = !hiddenBreadRoutes.includes(event.urlAfterRedirects);
      }
    });
  }
}
