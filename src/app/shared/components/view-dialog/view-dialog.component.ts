import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ViewDialogField {
  label: string;
  value: any;
}

export interface ViewDialogData {
  title: string;
  fields: ViewDialogField[];
}

@Component({
  selector: 'app-view-dialog',
  templateUrl: './view-dialog.component.html',
  styleUrls: ['./view-dialog.component.scss']
})
export class ViewDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ViewDialogData
  ) {}
}
