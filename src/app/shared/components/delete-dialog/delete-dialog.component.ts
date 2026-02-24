import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdvancedSettingsService } from 'src/app/core/services/advanced-settings.service';

export interface DeleteDialogData {
  title?: string;
  message: string;
  subMessage?: string;
  confirmText?: string;
  cancelText?: string;
  itemId?: any;
  whatsNewId?: any;
}

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent {
  isDeleting = false;

  constructor(
    private snack: MatSnackBar,
    private service: AdvancedSettingsService,
    private dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteDialogData
  ) {}

  confirm(): void {
    if (!this.data.itemId || !this.data.whatsNewId) {
      this.dialogRef.close(true);
      return;
    }

    this.isDeleting = true;

    this.service.deleteWhatsNew(this.data.itemId, this.data.whatsNewId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.dialogRef.close(true);

        this.snack.open('Entry deleted successfully', 'Close', {
          duration: 2500,
          panelClass: ['success-snackbar']
        });
      },
      error: () => {
        this.isDeleting = false;

        this.snack.open('Failed to delete entry', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  cancel(): void {
    if (!this.isDeleting) {
      this.dialogRef.close(false);
    }
  }
}
