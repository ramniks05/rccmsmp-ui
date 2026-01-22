import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegistrationFormAdminService } from '../../../services/registration-form-admin.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-registration-form-group-dialog',
  templateUrl: './registration-form-group-dialog.component.html',
  styleUrls: ['./registration-form-group-dialog.component.scss']
})
export class RegistrationFormGroupDialogComponent implements OnInit {
  groupForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RegistrationFormGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      mode: 'create' | 'edit';
      group?: any;
      registrationType: 'CITIZEN' | 'LAWYER';
    },
    private registrationFormService: RegistrationFormAdminService,
    private snackBar: MatSnackBar
  ) {
    this.groupForm = this.fb.group({
      groupCode: ['', [Validators.required, Validators.pattern(/^[a-z][a-z0-9_]*$/)]],
      groupLabel: ['', [Validators.required]],
      description: [null],
      displayOrder: [1, [Validators.required, Validators.min(1)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.group) {
      this.populateForm(this.data.group);
    }
  }

  /**
   * Populate form with existing group data
   */
  populateForm(group: any): void {
    this.groupForm.patchValue({
      groupCode: group.groupCode,
      groupLabel: group.groupLabel,
      description: group.description,
      displayOrder: group.displayOrder,
      isActive: group.isActive !== false
    });
    
    // Disable groupCode in edit mode
    this.groupForm.get('groupCode')?.disable();
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.groupForm.valid) {
      this.isLoading = true;
      
      const formValue = this.groupForm.getRawValue(); // Use getRawValue to get disabled field value
      
      const groupData = {
        registrationType: this.data.registrationType,
        groupCode: formValue.groupCode,
        groupLabel: formValue.groupLabel,
        description: formValue.description || null,
        displayOrder: formValue.displayOrder,
        isActive: formValue.isActive !== false
      };

      const observable = this.data.mode === 'create'
        ? this.registrationFormService.createFieldGroup(groupData)
        : this.registrationFormService.updateFieldGroup(this.data.group!.id!, groupData);

      observable
        .pipe(
          catchError(error => {
            this.isLoading = false;
            this.handleError(error);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response: any) => {
            this.isLoading = false;
            const apiResponse = response?.success !== undefined ? response : { success: true, message: 'Group saved successfully' };
            this.snackBar.open(apiResponse.message || 'Group saved successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: () => {
            this.isLoading = false;
          }
        });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.groupForm.controls).forEach(key => {
        this.groupForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: any): void {
    console.error('Error:', error);
    let errorMessage = 'An error occurred. Please try again.';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    }
    
    this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
  }

  /**
   * Cancel dialog
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }
}
