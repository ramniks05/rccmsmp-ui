import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CitizenCaseService, Case, CaseHistory } from '../services/citizen-case.service';

@Component({
  selector: 'app-case-details',
  templateUrl: './case-details.component.html',
  styleUrls: ['./case-details.component.scss']
})
export class CaseDetailsComponent implements OnInit {
  caseId!: number;
  case: Case | null = null;
  history: CaseHistory[] = [];
  isLoading = false;
  isLoadingHistory = false;
  returnComment = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CitizenCaseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.caseId = +params['id'];
      if (this.caseId) {
        this.loadCaseDetails();
        this.loadCaseHistory();
      }
    });
  }

  loadCaseDetails(): void {
    this.isLoading = true;
    this.caseService.getCaseById(this.caseId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.case = response.data;
        } else {
          this.snackBar.open(response.message || 'Failed to load case details', 'Close', { duration: 5000 });
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error?.error?.message || error?.message || 'Failed to load case details';
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  loadCaseHistory(): void {
    this.isLoadingHistory = true;
    this.caseService.getCaseHistory(this.caseId).subscribe({
      next: (response) => {
        this.isLoadingHistory = false;
        if (response.success) {
          this.history = response.data || [];
          // Find return for correction comment
          const returned = this.history
            .filter(h => h.toState?.stateCode === 'RETURNED_FOR_CORRECTION')
            .slice(-1)[0];
          if (returned?.comments) {
            this.returnComment = returned.comments;
          }
        }
      },
      error: (error) => {
        this.isLoadingHistory = false;
        console.error('Error loading case history:', error);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'RETURNED_FOR_CORRECTION') {
      return 'badge-warning';
    } else if (status.includes('COMPLETED') || status.includes('APPROVED')) {
      return 'badge-success';
    } else if (status.includes('REJECTED') || status.includes('CANCELLED')) {
      return 'badge-danger';
    }
    return 'badge-info';
  }

  getStatusLabel(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  canResubmit(): boolean {
    return this.case?.status === 'RETURNED_FOR_CORRECTION';
  }

  navigateToResubmit(): void {
    if (this.caseId) {
      this.router.navigate(['/citizen/cases', this.caseId, 'resubmit']);
    }
  }

  parseCaseData(caseData?: string): any {
    if (!caseData) return null;
    try {
      return JSON.parse(caseData);
    } catch (e) {
      return null;
    }
  }
}
