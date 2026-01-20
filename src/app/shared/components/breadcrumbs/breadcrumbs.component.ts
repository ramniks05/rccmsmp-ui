import { Component } from '@angular/core';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent {
  constructor(public breadcrumbService: BreadcrumbService) {}
}
