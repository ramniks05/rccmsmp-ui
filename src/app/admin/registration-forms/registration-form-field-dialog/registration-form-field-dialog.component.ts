import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegistrationFormAdminService, RegistrationFormField } from '../../services/registration-form-admin.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-registration-form-field-dialog',
  templateUrl: './registration-form-field-dialog.component.html',
  styleUrls: ['./registration-form-field-dialog.component.scss']
})
export class RegistrationFormFieldDialogComponent implements OnInit {
  fieldForm: FormGroup;
  isLoading = false;
  fieldTypes = ['TEXT', 'EMAIL', 'PHONE', 'DATE', 'DROPDOWN', 'TEXTAREA', 'NUMBER', 'PASSWORD'];
  dataSourceTypes = ['ADMIN_UNITS'];
  unitLevels = ['STATE', 'DISTRICT', 'SUB_DIVISION', 'CIRCLE'];
  fieldGroups: any[] = [];
  loadingGroups = false;
  
  showDataSourceConfig = false;
  showFieldOptions = false;
  showValidationRules = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RegistrationFormFieldDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      mode: 'create' | 'edit';
      field?: RegistrationFormField;
      registrationType: 'CITIZEN' | 'LAWYER';
    },
    private registrationFormService: RegistrationFormAdminService,
    private snackBar: MatSnackBar
  ) {
    this.fieldForm = this.fb.group({
      fieldName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/)]],
      fieldLabel: ['', [Validators.required]],
      fieldType: ['TEXT', [Validators.required]],
      isRequired: [false],
      displayOrder: [1, [Validators.required, Validators.min(1)]],
      isActive: [true],
      defaultValue: [null],
      placeholder: [null],
      helpText: [null],
      fieldGroup: [null],
      
      // Conditional fields
      validationRules: [null],
      fieldOptions: [null],
      dataSource: [null],
      conditionalLogic: [null]
    });
  }

  ngOnInit(): void {
    // Load field groups for dropdown
    this.loadFieldGroups();

    if (this.data.mode === 'edit' && this.data.field) {
      this.populateForm(this.data.field);
    }

    // Show/hide conditional fields based on field type
    this.fieldForm.get('fieldType')?.valueChanges.subscribe(type => {
      this.updateConditionalFields(type);
    });

    // Initialize conditional fields visibility
    const currentType = this.fieldForm.get('fieldType')?.value;
    if (currentType) {
      this.updateConditionalFields(currentType);
    }
  }

  /**
   * Load field groups for dropdown
   */
  loadFieldGroups(): void {
    this.loadingGroups = true;
    this.registrationFormService.getFieldGroupOptions(this.data.registrationType)
      .subscribe({
        next: (response) => {
          this.loadingGroups = false;
          const apiResponse = response?.success !== undefined ? response : { success: true, data: response };
          if (apiResponse.success) {
            this.fieldGroups = apiResponse.data || [];
          }
        },
        error: (error) => {
          this.loadingGroups = false;
          console.error('Error loading field groups:', error);
          // Continue with empty groups - user can still type manually
        }
      });
  }

  /**
   * Update conditional fields visibility based on field type
   */
  updateConditionalFields(fieldType: string): void {
    // Show dataSource config for DROPDOWN fields
    this.showDataSourceConfig = fieldType === 'DROPDOWN';
    
    // Show fieldOptions for DROPDOWN fields (if not using dataSource)
    this.showFieldOptions = fieldType === 'DROPDOWN';
    
    // Show validation rules for all fields except DROPDOWN with dataSource
    this.showValidationRules = true;
    
    // Update validators
    if (fieldType === 'DROPDOWN') {
      // For dropdown, either dataSource or fieldOptions should be provided
      this.fieldForm.get('dataSource')?.setValidators(null);
      this.fieldForm.get('fieldOptions')?.setValidators(null);
    } else {
      this.fieldForm.get('dataSource')?.setValidators(null);
      this.fieldForm.get('fieldOptions')?.setValidators(null);
    }
    
    this.fieldForm.get('dataSource')?.updateValueAndValidity();
    this.fieldForm.get('fieldOptions')?.updateValueAndValidity();
  }

  /**
   * Populate form with existing field data
   */
  populateForm(field: RegistrationFormField): void {
    this.fieldForm.patchValue({
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      displayOrder: field.displayOrder,
      isActive: field.isActive,
      defaultValue: field.defaultValue,
      placeholder: field.placeholder,
      helpText: field.helpText,
      fieldGroup: field.fieldGroup,
      validationRules: field.validationRules,
      fieldOptions: field.fieldOptions,
      dataSource: field.dataSource,
      conditionalLogic: field.conditionalLogic
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.fieldForm.valid) {
      this.isLoading = true;
      
      const formValue = this.fieldForm.value;
      
      // Build field object
      const fieldData: RegistrationFormField = {
        registrationType: this.data.registrationType,
        fieldName: formValue.fieldName,
        fieldLabel: formValue.fieldLabel,
        fieldType: formValue.fieldType,
        isRequired: formValue.isRequired || false,
        displayOrder: formValue.displayOrder,
        isActive: formValue.isActive !== false,
        defaultValue: formValue.defaultValue || null,
        placeholder: formValue.placeholder || null,
        helpText: formValue.helpText || null,
        fieldGroup: formValue.fieldGroup || null,
        validationRules: formValue.validationRules || null,
        fieldOptions: formValue.fieldOptions || null,
        dataSource: formValue.dataSource || null,
        conditionalLogic: formValue.conditionalLogic || null
      };

      // Format JSON strings if needed
      if (formValue.validationRules && typeof formValue.validationRules === 'object') {
        fieldData.validationRules = JSON.stringify(formValue.validationRules);
      }
      if (formValue.fieldOptions && typeof formValue.fieldOptions === 'object') {
        fieldData.fieldOptions = JSON.stringify(formValue.fieldOptions);
      }
      if (formValue.dataSource && typeof formValue.dataSource === 'object') {
        fieldData.dataSource = JSON.stringify(formValue.dataSource);
      }
      if (formValue.conditionalLogic && typeof formValue.conditionalLogic === 'object') {
        fieldData.conditionalLogic = JSON.stringify(formValue.conditionalLogic);
      }

      const observable = this.data.mode === 'create'
        ? this.registrationFormService.createRegistrationFormField(fieldData)
        : this.registrationFormService.updateRegistrationFormField(this.data.field!.id!, fieldData);

      observable
        .pipe(
          catchError(error => {
            this.isLoading = false;
            this.handleError(error);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            const apiResponse = response?.success !== undefined ? response : { success: true, message: 'Field saved successfully' };
            this.snackBar.open(apiResponse.message || 'Field saved successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: () => {
            this.isLoading = false;
          }
        });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.fieldForm.controls).forEach(key => {
        this.fieldForm.get(key)?.markAsTouched();
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

  /**
   * Get validation rules as object
   */
  getValidationRulesObject(): any {
    const rules = this.fieldForm.get('validationRules')?.value;
    if (!rules) return {};
    try {
      return typeof rules === 'string' ? JSON.parse(rules) : rules;
    } catch {
      return {};
    }
  }

  /**
   * Set validation rules from object
   */
  setValidationRules(rules: any): void {
    this.fieldForm.patchValue({
      validationRules: JSON.stringify(rules)
    });
  }

  /**
   * Get data source as object
   */
  getDataSourceObject(): any {
    const dataSource = this.fieldForm.get('dataSource')?.value;
    if (!dataSource) return null;
    try {
      return typeof dataSource === 'string' ? JSON.parse(dataSource) : dataSource;
    } catch {
      return null;
    }
  }

  /**
   * Set data source from object
   */
  setDataSource(dataSource: any): void {
    this.fieldForm.patchValue({
      dataSource: JSON.stringify(dataSource)
    });
  }
}
