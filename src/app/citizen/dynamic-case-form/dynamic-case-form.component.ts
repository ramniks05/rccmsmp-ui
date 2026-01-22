import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormSchemaService } from 'src/app/core/services/form-schema.service';
import { CitizenCaseService, CaseSubmissionRequest } from '../services/citizen-case.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dynamic-case-form',
  templateUrl: './dynamic-case-form.component.html',
  styleUrls: ['./dynamic-case-form.component.scss'],
})
export class DynamicCaseFormComponent implements OnInit {
  form!: FormGroup;
  fields: any[] = [];
  caseTypeName = '';
  caseTypeId: number | null = null;
  icon = 'description'; // default icon
  isSubmitting = false;
  units: any[] = [];
  selectedUnitId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private schemaService: FormSchemaService,
    private caseService: CitizenCaseService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.caseTypeId = Number(this.route.snapshot.paramMap.get('caseTypeId'));

    // icon from route param
    const routeIcon = this.route.snapshot.paramMap.get('icon');
    if (routeIcon) {
      this.icon = routeIcon;
    }

    if (this.caseTypeId) {
      this.loadSchema(this.caseTypeId);
      this.loadUnits();
    }
  }

  loadUnits(): void {
    // Load administrative units for selection
    this.caseService.getActiveUnits().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.units = Array.isArray(response.data) ? response.data : [];
        }
      },
      error: (error: any) => {
        console.error('Error loading units:', error);
        // Continue without units - user can still submit
        // Note: If endpoint requires auth, ensure it's public or add auth headers in service
      }
    });
  }

  loadSchema(caseTypeId: number): void {
    this.schemaService.getFormSchema(caseTypeId).subscribe({
      next: (res) => {
        const data = res.data;

        this.caseTypeName = data.caseTypeName;

        this.fields = data.fields
          .filter((f: any) => f.isActive)
          .sort((a: any, b: any) => a.displayOrder - b.displayOrder);

        this.buildForm();
      },
      error: (err) => {
        console.error('Error loading form schema', err);
      },
    });
  }

  buildForm(): void {
    const group: any = {};

    this.fields.forEach((field) => {
      const validators = [];

      if (field.isRequired) {
        validators.push(Validators.required);
      }

      if (field.validationRules) {
        try {
          const rules = JSON.parse(field.validationRules);

          if (rules.minLength) {
            validators.push(Validators.minLength(rules.minLength));
          }
          if (rules.maxLength) {
            validators.push(Validators.maxLength(rules.maxLength));
          }
          if (rules.pattern) {
            validators.push(Validators.pattern(rules.pattern));
          }
        } catch (e) {
          console.warn('Invalid validationRules JSON', field.validationRules);
        }
      }

      group[field.fieldName] = [field.defaultValue ?? null, validators];
    });

    this.form = this.fb.group(group);
  }

  onFileChange(event: Event, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      this.form.get(fieldName)?.setValue(input.files[0]);
    }
  }

  submit(): void {
    if (!this.form || this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    if (!this.selectedUnitId) {
      this.snackBar.open('Please select an administrative unit', 'Close', { duration: 3000 });
      return;
    }

    if (!this.caseTypeId) {
      this.snackBar.open('Invalid case type', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;

    // Prepare form data - convert dates and files to strings
    const formValues: any = {};
    Object.entries(this.form.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // Handle Date objects
        if (value instanceof Date) {
          formValues[key] = value.toISOString().split('T')[0];
        } else if (value instanceof File) {
          // For files, we'll store the file name for now
          // In production, you might want to upload files separately
          formValues[key] = value.name;
        } else {
          formValues[key] = value;
        }
      }
    });

    // Convert form data to JSON string
    const caseDataJson = JSON.stringify(formValues);

    // Prepare submission request
    const submissionRequest: CaseSubmissionRequest = {
      caseTypeId: this.caseTypeId,
      unitId: this.selectedUnitId,
      subject: `${this.caseTypeName} Application`,
      description: formValues.description || '',
      priority: formValues.priority || 'MEDIUM',
      caseData: caseDataJson
    };

    // Submit case
    this.caseService.submitCase(submissionRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.snackBar.open('Case submitted successfully!', 'Close', { duration: 5000 });
          // Redirect to my cases after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/citizen/my-cases']);
          }, 2000);
        } else {
          this.snackBar.open(response.message || 'Failed to submit case', 'Close', { duration: 5000 });
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        let errorMessage = 'Failed to submit case';
        
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        this.snackBar.open(errorMessage, 'Close', { duration: 6000 });
        console.error('Case submission error:', error);
      }
    });
  }
}
