import { Component, Input, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegistrationFormAdminService } from '../../services/registration-form-admin.service';
import { RegistrationFormGroupDialogComponent } from './registration-form-group-dialog/registration-form-group-dialog.component';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface RegistrationFormGroup {
  id?: number;
  registrationType: 'CITIZEN' | 'LAWYER';
  groupCode: string;
  groupLabel: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

@Component({
  selector: 'app-registration-form-groups',
  templateUrl: './registration-form-groups.component.html',
  styleUrls: ['./registration-form-groups.component.scss']
})
export class RegistrationFormGroupsComponent implements OnInit, AfterViewInit {
  @Input() registrationType: 'CITIZEN' | 'LAWYER' = 'CITIZEN';
  
  displayedColumns: string[] = ['displayOrder', 'groupLabel', 'groupCode', 'description', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<RegistrationFormGroup>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = false;
  errorMessage = '';

  constructor(
    private registrationFormService: RegistrationFormAdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Load field groups
   */
  loadGroups(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.registrationFormService.getFieldGroups(this.registrationType)
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
            const groups = apiResponse.data || [];
            // Sort by displayOrder
            this.dataSource.data = groups.sort((a: RegistrationFormGroup, b: RegistrationFormGroup) => 
              a.displayOrder - b.displayOrder
            );
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
    const dialogRef = this.dialog.open(RegistrationFormGroupDialogComponent, {
      width: '600px',
      data: { 
        mode: 'create',
        registrationType: this.registrationType
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadGroups();
      }
    });
  }

  /**
   * Open edit dialog
   */
  openEditDialog(group: RegistrationFormGroup): void {
    const dialogRef = this.dialog.open(RegistrationFormGroupDialogComponent, {
      width: '600px',
      data: { 
        mode: 'edit',
        group: { ...group },
        registrationType: this.registrationType
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadGroups();
      }
    });
  }

  /**
   * Delete group
   */
  deleteGroup(group: RegistrationFormGroup): void {
    if (!group.id) {
      this.snackBar.open('Invalid group', 'Close', { duration: 3000 });
      return;
    }

    if (confirm(`Are you sure you want to delete the group "${group.groupLabel}"?`)) {
      this.isLoading = true;
      
      this.registrationFormService.deleteFieldGroup(group.id)
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
            const apiResponse = response?.success !== undefined ? response : { success: true, message: 'Group deleted successfully' };
            this.snackBar.open(apiResponse.message || 'Group deleted successfully', 'Close', { duration: 3000 });
            this.loadGroups();
          },
          error: () => {
            this.isLoading = false;
          }
        });
    }
  }

  /**
   * Apply filter
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
    console.error('Error:', error);
    if (error.error?.message) {
      this.errorMessage = error.error.message;
    } else if (error.error?.error) {
      this.errorMessage = error.error.error;
    } else {
      this.errorMessage = 'An error occurred. Please try again.';
    }
    this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
  }
}
