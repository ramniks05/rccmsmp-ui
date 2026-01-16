import { Component, OnInit, Inject, ChangeDetectorRef, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { catchError } from 'rxjs/operators';
import { throwError, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Form Field Definition Interface
 */
export interface FormFieldDefinition {
  id?: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  validationRules?: string;
  displayOrder: number;
  isActive: boolean;
  defaultValue?: string;
  fieldOptions?: string;
  placeholder?: string;
  helpText?: string;
  fieldGroup?: string;
  // Internal property for sanitized field name (used in preview)
  __sanitizedFieldName?: string;
}

/**
 * Form Schema Interface
 */
export interface FormSchema {
  caseTypeId: number;
  caseTypeName: string;
  caseTypeCode: string;
  totalFields: number;
  fields: FormFieldDefinition[];
}

/**
 * Form Schema Builder Component
 * Admin tool to create and manage dynamic form schemas for case types
 */
@Component({
  selector: 'app-form-schema-builder',
  templateUrl: './form-schema-builder.component.html',
  styleUrls: ['./form-schema-builder.component.scss']
})
export class FormSchemaBuilderComponent implements OnInit, OnDestroy {
  formSchema: FormSchema | null = null;
  previewForm: FormGroup = this.fb.group({});
  loading = false;
  saving = false;
  error: string | null = null;
  caseTypeId: number | null = null;
  caseTypeName: string = '';
  showPreview = false;
  private sortedFieldsCache: FormFieldDefinition[] = [];
  private destroy$ = new Subject<void>();
  private fieldsChanged = true; // Flag to track if fields changed
  fieldTypes = [
    { value: 'TEXT', label: 'Text' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'DATE', label: 'Date' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'PHONE', label: 'Phone' },
    { value: 'TEXTAREA', label: 'Textarea' },
    { value: 'SELECT', label: 'Dropdown' },
    { value: 'RADIO', label: 'Radio Buttons' },
    { value: 'CHECKBOX', label: 'Checkbox' },
    { value: 'FILE', label: 'File Upload' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.caseTypeId = +params['caseTypeId'];
        if (this.caseTypeId) {
          this.loadFormSchema(this.caseTypeId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load form schema from backend
   */
  loadFormSchema(caseTypeId: number): void {
    this.loading = true;
    this.error = null;

    this.adminService.getFormSchema(caseTypeId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.loading = false;
          // If schema doesn't exist yet (404), create empty schema
          if (error.status === 404) {
            this.initializeEmptySchema();
            return throwError(() => error);
          }
          // For other errors, show error but still try to get case type name
          this.handleError(error);
          this.initializeEmptySchema();
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.error = null; // Clear any errors
          const apiResponse = response?.success !== undefined ? response : { success: true, data: response };
          if (apiResponse.success && apiResponse.data) {
            this.formSchema = apiResponse.data;
            if (this.formSchema) {
              this.caseTypeName = this.formSchema.caseTypeName || this.formSchema.caseTypeCode || 'Case Type';
              // Reset preview state when schema loads
              this.showPreview = false;
              this.previewForm = this.fb.group({}, { emitEvent: false });
              this.sortedFieldsCache = [];
              this.fieldsChanged = true;
            }
          } else {
            this.initializeEmptySchema();
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Initialize empty schema if none exists
   */
  initializeEmptySchema(): void {
    // Get case type name from the list (which we know works)
    // This avoids 403 errors from getCaseTypeById endpoint
    if (this.caseTypeId && !isNaN(this.caseTypeId)) {
      this.loading = true;
      this.loadCaseTypeNameFromList();
    } else {
      // No caseTypeId - should not happen but handle gracefully
      this.error = 'Case type ID is missing or invalid';
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Open dialog to add/edit field
   */
  openFieldDialog(field?: FormFieldDefinition, index?: number): void {
    // Ensure formSchema exists
    if (!this.formSchema) {
      this.snackBar.open('Please wait for the form schema to load.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const dialogRef = this.dialog.open(FormFieldDialogComponent, {
      width: '700px',
      data: {
        field: field ? { ...field } : null,
        fieldTypes: this.fieldTypes,
        nextDisplayOrder: this.getNextDisplayOrder()
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          if (field && index !== undefined) {
            // Update existing field
            this.updateField(index, result);
          } else {
            // Add new field
            this.addField(result);
          }
        }
      });
  }

  /**
   * Add new field to schema
   */
  addField(field: FormFieldDefinition): void {
    if (!this.formSchema) return;
    
    // Ensure unique field name
    if (this.isFieldNameExists(field.fieldName)) {
      this.snackBar.open('Field name already exists. Please use a unique name.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.formSchema.fields.push(field);
    this.formSchema.totalFields = this.formSchema.fields.length;
    this.fieldsChanged = true;
    this.sortFields();
    
    // Rebuild preview form if preview is active
    if (this.showPreview) {
      setTimeout(() => {
        this.buildPreviewForm();
      }, 0);
    }
    this.cdr.markForCheck();
  }

  /**
   * Update existing field
   */
  updateField(index: number, field: FormFieldDefinition): void {
    if (!this.formSchema) return;
    
    // Check if field name changed and if new name already exists
    const oldField = this.formSchema.fields[index];
    if (oldField.fieldName !== field.fieldName && this.isFieldNameExists(field.fieldName)) {
      this.snackBar.open('Field name already exists. Please use a unique name.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.formSchema.fields[index] = field;
    this.fieldsChanged = true;
    this.sortFields();
    
    // Rebuild preview form if preview is active
    if (this.showPreview) {
      setTimeout(() => {
        this.buildPreviewForm();
      }, 0);
    }
    this.cdr.markForCheck();
  }

  /**
   * Delete field from schema
   */
  deleteField(index: number): void {
    if (!this.formSchema) return;
    
    const field = this.formSchema.fields[index];
    if (confirm(`Are you sure you want to delete field "${field.fieldLabel}"?`)) {
      this.formSchema.fields.splice(index, 1);
      this.formSchema.totalFields = this.formSchema.fields.length;
      this.fieldsChanged = true;
      
      // Rebuild preview form if preview is active
      if (this.showPreview) {
        setTimeout(() => {
          this.buildPreviewForm();
        }, 0);
      }
      this.cdr.markForCheck();
    }
  }

  /**
   * Move field up in order
   */
  moveFieldUp(index: number): void {
    if (index === 0 || !this.formSchema) return;
    const sortedFields = this.getSortedFields();
    
    // Swap display orders
    const tempOrder = sortedFields[index].displayOrder;
    sortedFields[index].displayOrder = sortedFields[index - 1].displayOrder;
    sortedFields[index - 1].displayOrder = tempOrder;
    
    // Sort with new orders and mark as changed
    this.formSchema.fields.sort((a, b) => a.displayOrder - b.displayOrder);
    this.fieldsChanged = true;
    this.cdr.markForCheck();
  }

  /**
   * Move field down in order
   */
  moveFieldDown(index: number): void {
    if (!this.formSchema) return;
    const sortedFields = this.getSortedFields();
    
    if (index >= sortedFields.length - 1) return;
    
    // Swap display orders
    const tempOrder = sortedFields[index].displayOrder;
    sortedFields[index].displayOrder = sortedFields[index + 1].displayOrder;
    sortedFields[index + 1].displayOrder = tempOrder;
    
    // Sort with new orders and mark as changed
    this.formSchema.fields.sort((a, b) => a.displayOrder - b.displayOrder);
    this.fieldsChanged = true;
    this.cdr.markForCheck();
  }

  /**
   * Sort fields by display order
   */
  sortFields(): void {
    if (!this.formSchema) return;
    this.formSchema.fields.sort((a, b) => a.displayOrder - b.displayOrder);
    // Don't update display orders here - only when actually reordering
  }

  /**
   * Update display orders to be sequential
   */
  updateDisplayOrders(): void {
    if (!this.formSchema) return;
    this.formSchema.fields.forEach((field, index) => {
      field.displayOrder = index + 1;
    });
  }

  /**
   * Get next display order number
   */
  getNextDisplayOrder(): number {
    if (!this.formSchema || this.formSchema.fields.length === 0) return 1;
    return Math.max(...this.formSchema.fields.map(f => f.displayOrder)) + 1;
  }

  /**
   * Check if field name already exists
   */
  isFieldNameExists(fieldName: string, excludeIndex?: number): boolean {
    if (!this.formSchema) return false;
    return this.formSchema.fields.some((field, index) => 
      field.fieldName === fieldName && index !== excludeIndex
    );
  }

  /**
   * Save form schema
   */
  saveSchema(): void {
    if (!this.formSchema) return;

    // Validate schema
    if (this.formSchema.fields.length === 0) {
      this.snackBar.open('Please add at least one field to the form.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.saving = true;
    this.error = null;

    // Check if schema exists (has IDs) to decide between POST and PUT
    const hasExistingFields = this.formSchema.fields.some(f => f.id);
    const saveMethod = hasExistingFields 
      ? this.adminService.updateFormSchema(this.caseTypeId!, this.formSchema)
      : this.adminService.saveFormSchema(this.caseTypeId!, this.formSchema);
    
    saveMethod
      .pipe(
        catchError(error => {
          this.saving = false;
          this.handleError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          this.saving = false;
          const apiResponse = response?.success !== undefined ? response : { success: true };
          if (apiResponse.success) {
            this.snackBar.open('Form schema saved successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            // Reload schema to get updated IDs
            this.loadFormSchema(this.caseTypeId!);
          }
        },
        error: () => {
          this.saving = false;
        }
      });
  }

  /**
   * Toggle preview mode
   */
  togglePreview(): void {
    if (!this.formSchema) {
      this.snackBar.open('Please wait for the form schema to load.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    this.showPreview = !this.showPreview;
    if (this.showPreview) {
      // Build preview form when switching to preview mode
      setTimeout(() => {
        this.buildPreviewForm();
      }, 0);
    }
    // Mark for check after toggle
    this.cdr.markForCheck();
  }

  /**
   * Build preview form
   */
  buildPreviewForm(): void {
    if (!this.formSchema || !this.formSchema.fields) {
      this.previewForm = this.fb.group({}, { emitEvent: false });
      this.cdr.markForCheck();
      return;
    }

    const formControls: { [key: string]: any } = {};

    // Get only active fields
    const activeFields = this.formSchema.fields.filter(field => field.isActive);
    
    if (activeFields.length === 0) {
      this.previewForm = this.fb.group({}, { emitEvent: false });
      this.cdr.markForCheck();
      return;
    }

    // Track field names to detect duplicates and map original to sanitized names
    const fieldNames = new Set<string>();

    // First pass: assign sanitized names to all active fields
    activeFields.forEach((field, index) => {
      // Validate field has required properties
      if (!field.fieldName || !field.fieldType) {
        console.warn(`Skipping field at index ${index} with missing fieldName or fieldType:`, field);
        return;
      }

      // Validate and sanitize field name (must be valid JavaScript identifier)
      // Only sanitize if the name is not already a valid identifier
      let sanitizedFieldName: string;
      
      if (this.isValidIdentifier(field.fieldName)) {
        // Name is already valid, use as-is unless it's a duplicate
        sanitizedFieldName = field.fieldName;
        
        // Check for duplicates
        if (fieldNames.has(sanitizedFieldName)) {
          let finalName = sanitizedFieldName;
          let counter = 0;
          while (fieldNames.has(finalName)) {
            counter++;
            finalName = `${sanitizedFieldName}_${counter}`;
          }
          sanitizedFieldName = finalName;
        }
      } else {
        // Name needs sanitization
        sanitizedFieldName = this.sanitizeFieldName(field.fieldName, fieldNames);
      }
      
      fieldNames.add(sanitizedFieldName);
      
      // Set sanitized name on the actual field object (activeFields items are references to formSchema.fields)
      field.__sanitizedFieldName = sanitizedFieldName;
    });
    
    // Invalidate cache so getSortedFields() will recalculate with sanitized names
    this.fieldsChanged = true;
    this.sortedFieldsCache = [];

    // Second pass: create form controls
    activeFields.forEach((field) => {
      if (!field.fieldName || !field.fieldType) {
        return;
      }
      
      const sanitizedFieldName = field.__sanitizedFieldName || field.fieldName;

      let initialValue: any = field.defaultValue || '';
      
      // Handle different field types
      if (field.fieldType === 'CHECKBOX') {
        initialValue = field.defaultValue === 'true';
      } else if (field.fieldType === 'NUMBER') {
        initialValue = field.defaultValue ? parseFloat(field.defaultValue) : null;
        if (isNaN(initialValue)) {
          initialValue = null;
        }
      } else if (field.fieldType === 'DATE') {
        // Keep date as string for now
        initialValue = field.defaultValue || null;
      } else if (field.fieldType === 'SELECT' || field.fieldType === 'RADIO') {
        // For SELECT/RADIO, validate options
        const options = this.getFieldOptions(field);
        if (options.length === 0 && field.fieldOptions) {
          console.warn(`Field ${field.fieldName} (${field.fieldLabel}) has ${field.fieldType} type but invalid options`);
        }
        // Default to empty string if no default value
        initialValue = field.defaultValue || '';
      }
      
      // Create form control with initial value using sanitized name
      formControls[sanitizedFieldName] = [initialValue];
    });

    // Create form group with emitEvent: false to prevent unnecessary change detection
    try {
      this.previewForm = this.fb.group(formControls, { emitEvent: false });
      console.log('Preview form built successfully with', Object.keys(formControls).length, 'fields');
      console.log('Form control names:', Object.keys(formControls));
      console.log('Field mappings:', activeFields.map(f => ({ original: f.fieldName, sanitized: f.__sanitizedFieldName })));
      
      // Verify all fields have sanitized names set
      activeFields.forEach(field => {
        if (!field.__sanitizedFieldName) {
          console.error(`Field ${field.fieldName} missing __sanitizedFieldName!`);
        }
      });
      
      this.cdr.markForCheck();
    } catch (error: any) {
      console.error('Error building preview form:', error);
      console.error('Form controls that failed:', formControls);
      console.error('Error details:', error.message || error);
      this.previewForm = this.fb.group({}, { emitEvent: false });
      this.cdr.markForCheck();
    }
  }

  /**
   * Check if a string is a valid JavaScript identifier
   */
  private isValidIdentifier(name: string): boolean {
    if (!name || typeof name !== 'string') return false;
    
    // JavaScript identifier rules:
    // - Must start with letter, underscore, or dollar sign
    // - Can contain letters, digits, underscore, or dollar sign
    // - Cannot be a reserved keyword (we'll allow common ones like 'name', 'type', etc.)
    const identifierRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    return identifierRegex.test(name.trim());
  }

  /**
   * Validate and sanitize field name to ensure it's a valid JavaScript identifier
   */
  private sanitizeFieldName(fieldName: string, existingNames: Set<string>): string {
    if (!fieldName || typeof fieldName !== 'string') {
      const generated = 'field_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      existingNames.add(generated);
      return generated;
    }
    
    let sanitized = fieldName.trim();
    
    // Replace spaces and special characters with underscores (keep underscores)
    sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '_');
    
    // Remove multiple consecutive underscores
    sanitized = sanitized.replace(/_+/g, '_');
    
    // Remove leading/trailing underscores
    sanitized = sanitized.replace(/^_+|_+$/g, '');
    
    // Ensure it doesn't start with a number
    if (/^[0-9]/.test(sanitized)) {
      sanitized = 'field_' + sanitized;
    }
    
    // Ensure it's not empty after sanitization
    if (!sanitized || sanitized.length === 0) {
      sanitized = 'field_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }
    
    // Check for duplicates and make unique if needed
    let finalName = sanitized;
    let counter = 0;
    while (existingNames.has(finalName)) {
      counter++;
      finalName = `${sanitized}_${counter}`;
    }
    
    existingNames.add(finalName);
    return finalName;
  }

  /**
   * Get sorted fields (cached for performance)
   */
  getSortedFields(): FormFieldDefinition[] {
    if (!this.formSchema || !this.formSchema.fields) {
      this.sortedFieldsCache = [];
      return [];
    }
    
    // Only recalculate if fields changed
    if (this.fieldsChanged || this.sortedFieldsCache.length !== this.formSchema.fields.length) {
      // Create a shallow copy and sort
      this.sortedFieldsCache = [...this.formSchema.fields].sort((a, b) => a.displayOrder - b.displayOrder);
      this.fieldsChanged = false;
    }
    
    return this.sortedFieldsCache;
  }

  /**
   * Get sorted fields count (optimized for template)
   */
  getSortedFieldsCount(): number {
    return this.getSortedFields().length;
  }

  /**
   * Load case type name from case types list (primary method)
   * This uses the getAllCaseTypes endpoint which we know works
   */
  private loadCaseTypeNameFromList(): void {
    if (!this.caseTypeId) {
      this.createDefaultSchema();
      return;
    }
    
    // Get case type name from the list of all case types
    this.adminService.getAllCaseTypes()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.loading = false;
          console.error('Error loading case types list:', error);
          // If that also fails, use default
          this.createDefaultSchema();
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.error = null; // Clear any previous errors
          const apiResponse = response?.success !== undefined ? response : { success: true, data: response };
          if (apiResponse.success && apiResponse.data) {
            const caseTypes = Array.isArray(apiResponse.data) ? apiResponse.data : [];
            const caseType = caseTypes.find((ct: any) => ct.id === this.caseTypeId);
            
            if (caseType) {
              this.formSchema = {
                caseTypeId: this.caseTypeId!,
                caseTypeName: caseType.name || caseType.code || `Case Type ${this.caseTypeId}`,
                caseTypeCode: caseType.code || '',
                totalFields: 0,
                fields: []
              };
              this.caseTypeName = this.formSchema.caseTypeName;
            } else {
              // Case type not found in list, use default
              this.createDefaultSchema();
            }
          } else {
            this.createDefaultSchema();
          }
          this.showPreview = false;
          this.previewForm = this.fb.group({}, { emitEvent: false });
          this.sortedFieldsCache = [];
          this.fieldsChanged = true;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Create default schema when case type cannot be loaded
   */
  private createDefaultSchema(): void {
    this.formSchema = {
      caseTypeId: this.caseTypeId!,
      caseTypeName: `Case Type ${this.caseTypeId}`,
      caseTypeCode: '',
      totalFields: 0,
      fields: []
    };
    this.caseTypeName = `Case Type ${this.caseTypeId}`;
    this.showPreview = false;
    this.previewForm = this.fb.group({}, { emitEvent: false });
    this.sortedFieldsCache = [];
    this.fieldsChanged = true;
    this.cdr.markForCheck();
  }

  /**
   * Get active fields count
   */
  getActiveFieldsCount(): number {
    if (!this.formSchema || !this.formSchema.fields) return 0;
    return this.formSchema.fields.filter((f: FormFieldDefinition) => f.isActive).length;
  }

  /**
   * Check if there are active fields to preview
   */
  hasActiveFields(): boolean {
    if (!this.formSchema || !this.formSchema.fields) return false;
    return this.getActiveFieldsCount() > 0;
  }

  /**
   * Get field type label
   */
  getFieldTypeLabel(fieldType: string): string {
    const type = this.fieldTypes.find(t => t.value === fieldType);
    return type ? type.label : fieldType;
  }

  /**
   * Parse field options for display
   */
  getFieldOptionsDisplay(field: FormFieldDefinition): string {
    if (!field.fieldOptions) return '-';
    try {
      const options = JSON.parse(field.fieldOptions);
      if (Array.isArray(options)) {
        return options.map((opt: any) => opt.label || opt.value).join(', ');
      }
    } catch (e) {
      return field.fieldOptions;
    }
    return '-';
  }

  /**
   * Get field options as array (for preview)
   */
  getFieldOptions(field: FormFieldDefinition): any[] {
    if (!field || !field.fieldOptions) return [];
    
    // If it's already an array, return it
    if (Array.isArray(field.fieldOptions)) {
      return field.fieldOptions;
    }
    
    // If it's a string, try to parse it
    if (typeof field.fieldOptions === 'string') {
      try {
        const parsed = JSON.parse(field.fieldOptions);
        // Ensure it's an array
        if (Array.isArray(parsed)) {
          // Validate each option has value and label
          return parsed.map((opt: any, index: number) => {
            if (typeof opt === 'string') {
              return { value: opt, label: opt };
            } else if (typeof opt === 'object' && opt !== null) {
              return {
                value: opt.value !== undefined ? String(opt.value) : `option_${index}`,
                label: opt.label !== undefined ? String(opt.label) : String(opt.value || `Option ${index + 1}`)
              };
            }
            return { value: `option_${index}`, label: `Option ${index + 1}` };
          });
        }
      } catch (e) {
        console.warn(`Failed to parse fieldOptions for field ${field.fieldName}:`, e);
        return [];
      }
    }
    
    return [];
  }

  /**
   * Get icon for field type
   */
  getFieldIcon(fieldType: string): string {
    const iconMap: { [key: string]: string } = {
      'TEXT': 'text_fields',
      'NUMBER': 'numbers',
      'DATE': 'calendar_today',
      'EMAIL': 'email',
      'PHONE': 'phone',
      'TEXTAREA': 'notes',
      'SELECT': 'list',
      'RADIO': 'radio_button_checked',
      'CHECKBOX': 'check_box',
      'FILE': 'attach_file'
    };
    return iconMap[fieldType] || 'label';
  }

  /**
   * Handle errors
   */
  private handleError(error: any): void {
    if (error.error?.message) {
      this.error = error.error.message;
    } else if (error.status === 401) {
      this.error = 'Unauthorized. Please login again.';
    } else {
      this.error = error.message || 'An error occurred. Please try again.';
    }
    const errorMessage = this.error || 'An error occurred. Please try again.';
    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    // Reset preview state before navigating
    this.showPreview = false;
    this.previewForm = this.fb.group({}, { emitEvent: false });
    this.sortedFieldsCache = [];
    this.fieldsChanged = true;
    this.router.navigate(['/admin/case-types']);
  }
}

/**
 * Dialog Component for Add/Edit Form Field
 */

@Component({
  selector: 'app-form-field-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.field ? 'Edit' : 'Add' }} Form Field</h2>
    <mat-dialog-content>
      <form [formGroup]="fieldForm" class="field-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Field Name *</mat-label>
          <input matInput formControlName="fieldName" placeholder="e.g., applicant_name">
          <mat-hint>Unique identifier (no spaces, use underscore)</mat-hint>
          <mat-error *ngIf="fieldForm.get('fieldName')?.hasError('required')">Field name is required</mat-error>
          <mat-error *ngIf="fieldForm.get('fieldName')?.hasError('pattern')">Only letters, numbers, and underscores allowed</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Field Label *</mat-label>
          <input matInput formControlName="fieldLabel" placeholder="e.g., Applicant Name">
          <mat-error *ngIf="fieldForm.get('fieldLabel')?.hasError('required')">Field label is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Field Type *</mat-label>
          <mat-select formControlName="fieldType">
            <mat-option *ngFor="let type of data.fieldTypes" [value]="type.value">
              {{ type.label }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="fieldForm.get('fieldType')?.hasError('required')">Field type is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width" *ngIf="needsOptions()">
          <mat-label>Options (JSON Array)</mat-label>
          <textarea matInput formControlName="fieldOptions" rows="4" placeholder='Enter JSON array format'></textarea>
          <mat-hint>For SELECT/RADIO: [{{ '{' }}"value": "val1", "label": "Label 1"{{ '}' }}]</mat-hint>
          <mat-error *ngIf="fieldForm.get('fieldOptions')?.hasError('invalidJson')">Invalid JSON format</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Placeholder</mat-label>
          <input matInput formControlName="placeholder">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Help Text</mat-label>
          <textarea matInput formControlName="helpText" rows="2"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Default Value</mat-label>
          <input matInput formControlName="defaultValue">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Display Order</mat-label>
          <input type="number" matInput formControlName="displayOrder" min="1">
        </mat-form-field>

        <div class="form-actions">
          <mat-checkbox formControlName="isRequired">Required Field</mat-checkbox>
          <mat-checkbox formControlName="isActive">Active</mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="fieldForm.invalid">
        {{ data.field ? 'Update' : 'Add' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .field-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px 0;
      min-width: 600px;
    }
    .full-width {
      width: 100%;
    }
    .form-actions {
      display: flex;
      gap: 24px;
      margin-top: 8px;
    }
  `]
})
export class FormFieldDialogComponent {
  fieldForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FormFieldDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const field = data.field || {};
    this.fieldForm = this.fb.group({
      fieldName: [field.fieldName || '', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      fieldLabel: [field.fieldLabel || '', Validators.required],
      fieldType: [field.fieldType || 'TEXT', Validators.required],
      fieldOptions: [field.fieldOptions || ''],
      placeholder: [field.placeholder || ''],
      helpText: [field.helpText || ''],
      defaultValue: [field.defaultValue || ''],
      displayOrder: [field.displayOrder || data.nextDisplayOrder || 1, [Validators.required, Validators.min(1)]],
      isRequired: [field.isRequired !== undefined ? field.isRequired : false],
      isActive: [field.isActive !== undefined ? field.isActive : true]
    });

    // Validate JSON for options when field type is SELECT or RADIO
    this.fieldForm.get('fieldType')?.valueChanges.subscribe(() => {
      this.validateOptions();
    });
    this.fieldForm.get('fieldOptions')?.valueChanges.subscribe(() => {
      this.validateOptions();
    });
  }

  needsOptions(): boolean {
    const fieldType = this.fieldForm.get('fieldType')?.value;
    return fieldType === 'SELECT' || fieldType === 'RADIO';
  }

  validateOptions(): void {
    const fieldType = this.fieldForm.get('fieldType')?.value;
    const options = this.fieldForm.get('fieldOptions')?.value;
    
    if ((fieldType === 'SELECT' || fieldType === 'RADIO') && options) {
      try {
        JSON.parse(options);
        this.fieldForm.get('fieldOptions')?.setErrors(null);
      } catch (e) {
        this.fieldForm.get('fieldOptions')?.setErrors({ invalidJson: true });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.fieldForm.valid) {
      this.dialogRef.close(this.fieldForm.value);
    }
  }
}

