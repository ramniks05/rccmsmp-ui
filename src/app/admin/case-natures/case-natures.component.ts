import { Component, OnInit, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AdminService } from '../admin.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * Case Natures Component
 * Manages case natures with CRUD operations
 */
@Component({
  selector: 'app-case-natures',
  templateUrl: './case-natures.component.html',
  styleUrls: ['./case-natures.component.scss']
})
export class CaseNaturesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'natureCode', 'natureName', 'caseTypeName', 'courtLevel', 'isAppeal', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = false;
  errorMessage = '';
  caseTypes: any[] = [];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCaseTypes();
    this.loadCaseNatures();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Load case types for dropdown
   */
  loadCaseTypes(): void {
    this.adminService.getActiveCaseTypes()
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          const apiResponse = response?.success !== undefined ? response : { success: true, data: response };
          if (apiResponse.success) {
            this.caseTypes = apiResponse.data || [];
          }
        }
      });
  }

  /**
   * Load all case natures
   */
  loadCaseNatures(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.adminService.getAllCaseNatures()
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
          const apiResponse = response?.success !== undefined ? response : { success: true, data: response };
          if (apiResponse.success) {
            this.dataSource.data = apiResponse.data || [];
          }
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  /**
   * Open create dialog
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CaseNatureDialogComponent, {
      width: '800px',
      data: { mode: 'create', caseTypes: this.caseTypes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCaseNatures();
      }
    });
  }

  /**
   * Open edit dialog
   */
  openEditDialog(caseNature: any): void {
    const dialogRef = this.dialog.open(CaseNatureDialogComponent, {
      width: '800px',
      data: { mode: 'edit', caseNature: caseNature, caseTypes: this.caseTypes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCaseNatures();
      }
    });
  }

  /**
   * Delete case nature
   */
  deleteCaseNature(caseNature: any): void {
    if (confirm(`Are you sure you want to delete "${caseNature.natureName}"?`)) {
      this.isLoading = true;
      this.adminService.deleteCaseNature(caseNature.id)
        .pipe(
          catchError(error => {
            this.isLoading = false;
            this.showError(error.error?.message || 'Failed to delete case nature');
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            const apiResponse = response?.success !== undefined ? response : { success: true };
            if (apiResponse.success) {
              this.showSuccess('Case nature deleted successfully');
              this.loadCaseNatures();
            }
          },
          error: () => {
            this.isLoading = false;
          }
        });
    }
  }

  /**
   * Apply filter to table
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: any): void {
    if (error.error?.message) {
      this.errorMessage = error.error.message;
    } else if (error.status === 401) {
      this.errorMessage = 'Unauthorized. Please login again.';
    } else {
      this.errorMessage = 'Failed to load case natures. Please try again.';
    }
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}

/**
 * Dialog Component for Create/Edit Case Nature
 */
@Component({
  selector: 'app-case-nature-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create' : 'Edit' }} Case Nature</h2>
    <mat-dialog-content>
      <form [formGroup]="caseNatureForm" class="case-nature-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Case Type *</mat-label>
          <mat-select formControlName="caseTypeId">
            <mat-option *ngFor="let ct of data.caseTypes" [value]="ct.id">
              {{ ct.name }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="caseNatureForm.get('caseTypeId')?.hasError('required')">Case Type is required</mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Nature Code *</mat-label>
            <input matInput formControlName="natureCode" placeholder="e.g., NEW_FILE">
            <mat-error *ngIf="caseNatureForm.get('natureCode')?.hasError('required')">Nature Code is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Nature Name *</mat-label>
            <input matInput formControlName="natureName" placeholder="e.g., New File">
            <mat-error *ngIf="caseNatureForm.get('natureName')?.hasError('required')">Nature Name is required</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Court Level *</mat-label>
            <mat-select formControlName="courtLevel">
              <mat-option value="CIRCLE">Circle</mat-option>
              <mat-option value="SUB_DIVISION">Sub-Division</mat-option>
              <mat-option value="DISTRICT">District</mat-option>
              <mat-option value="STATE">State</mat-option>
            </mat-select>
            <mat-error *ngIf="caseNatureForm.get('courtLevel')?.hasError('required')">Court Level is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>From Level (for appeals)</mat-label>
            <mat-select formControlName="fromLevel">
              <mat-option [value]="null">None (New File)</mat-option>
              <mat-option value="CIRCLE">Circle</mat-option>
              <mat-option value="SUB_DIVISION">Sub-Division</mat-option>
              <mat-option value="DISTRICT">District</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Court Types *</mat-label>
          <mat-select formControlName="courtTypes" multiple>
            <mat-option value="SDC_COURT">SDC Court</mat-option>
            <mat-option value="SDO_COURT">SDO Court</mat-option>
            <mat-option value="DC_COURT">DC Court</mat-option>
            <mat-option value="REVENUE_COURT">Revenue Court</mat-option>
            <mat-option value="REVENUE_TRIBUNAL">Revenue Tribunal</mat-option>
            <mat-option value="STATE_TRIBUNAL">State Tribunal</mat-option>
          </mat-select>
          <mat-error *ngIf="caseNatureForm.get('courtTypes')?.hasError('required')">At least one Court Type is required</mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-checkbox formControlName="isAppeal">Is Appeal</mat-checkbox>
          <mat-form-field appearance="outline" class="half-width" *ngIf="caseNatureForm.get('isAppeal')?.value">
            <mat-label>Appeal Order</mat-label>
            <input matInput type="number" formControlName="appealOrder" min="0" placeholder="0, 1, 2...">
            <mat-hint>0 for new files, 1 for first appeal, 2 for second appeal</mat-hint>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Enter description"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Display Order</mat-label>
          <input matInput type="number" formControlName="displayOrder" min="0" placeholder="1">
        </mat-form-field>

        <mat-checkbox formControlName="isActive">Active</mat-checkbox>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="caseNatureForm.invalid || isLoading">
        <mat-spinner *ngIf="isLoading" diameter="20" class="button-spinner"></mat-spinner>
        <span *ngIf="!isLoading">{{ data.mode === 'create' ? 'Create' : 'Update' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .case-nature-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px 0;
      min-width: 700px;
    }
    .full-width {
      width: 100%;
    }
    .form-row {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .half-width {
      flex: 1;
    }
    .button-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class CaseNatureDialogComponent {
  caseNatureForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    public dialogRef: MatDialogRef<CaseNatureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) {
    this.caseNatureForm = this.fb.group({
      caseTypeId: ['', [Validators.required]],
      natureCode: ['', [Validators.required]],
      natureName: ['', [Validators.required]],
      courtLevel: ['', [Validators.required]],
      courtTypes: [[], [Validators.required]],
      fromLevel: [null],
      isAppeal: [false],
      appealOrder: [0],
      description: [''],
      displayOrder: [1],
      isActive: [true]
    });

    if (data.mode === 'edit' && data.caseNature) {
      this.caseNatureForm.patchValue({
        caseTypeId: data.caseNature.caseTypeId,
        natureCode: data.caseNature.natureCode,
        natureName: data.caseNature.natureName,
        courtLevel: data.caseNature.courtLevel,
        courtTypes: data.caseNature.courtTypes || [],
        fromLevel: data.caseNature.fromLevel,
        isAppeal: data.caseNature.isAppeal || false,
        appealOrder: data.caseNature.appealOrder || 0,
        description: data.caseNature.description || '',
        displayOrder: data.caseNature.displayOrder || 1,
        isActive: data.caseNature.isActive !== false
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.caseNatureForm.valid) {
      this.isLoading = true;
      const formValue = this.caseNatureForm.value;

      const caseNatureData = {
        ...formValue,
        fromLevel: formValue.fromLevel || null
      };

      const request = this.data.mode === 'create'
        ? this.adminService.createCaseNature(caseNatureData)
        : this.adminService.updateCaseNature(this.data.caseNature.id, caseNatureData);

      request
        .pipe(
          catchError(error => {
            this.isLoading = false;
            this.snackBar.open(error.error?.message || 'Operation failed', 'Close', { duration: 3000 });
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            const apiResponse = response?.success !== undefined ? response : { success: true };
            if (apiResponse.success) {
              this.snackBar.open(`Case nature ${this.data.mode === 'create' ? 'created' : 'updated'} successfully`, 'Close', { duration: 3000 });
              this.dialogRef.close(true);
            }
          },
          error: () => {
            this.isLoading = false;
          }
        });
    }
  }
}
