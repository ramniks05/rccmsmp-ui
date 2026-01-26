import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  timestamp?: string;
  data: T;
}

// Case DTO
export interface CaseDTO {
  id: number;
  caseNumber: string;
  caseTypeId: number;
  caseTypeName: string;
  caseTypeCode: string;
  caseNatureId: number;
  caseNatureName: string;
  caseNatureCode: string;
  applicantId: number;
  applicantName: string;
  applicantMobile: string;
  applicantEmail?: string;
  subject: string;
  description?: string;
  status: string;
  statusName?: string;
  priority: string;
  applicationDate: string;
  resolvedDate?: string;
  remarks?: string;
  caseData?: string; // JSON string
  currentStateCode: string;
  currentStateName: string;
  assignedToOfficerId?: number;
  assignedToOfficerName?: string;
  assignedToRole?: string;
  assignedToUnitId?: number;
  assignedToUnitName?: string;
  workflowInstanceId?: number;
  workflowCode?: string;
  createdAt: string;
  updatedAt: string;
}

// Workflow Transition DTO
export interface WorkflowTransitionDTO {
  id: number;
  transitionCode: string;
  transitionName: string;
  fromStateCode: string;
  toStateCode: string;
  requiresComment: boolean;
  description?: string;
}

// Execute Transition DTO
export interface ExecuteTransitionDTO {
  caseId?: number;
  transitionCode: string;
  comments?: string;
}

// Workflow History
export interface WorkflowHistory {
  id: number;
  caseId: number;
  transitionCode: string;
  transitionName: string;
  fromStateCode: string;
  toStateCode: string;
  performedByOfficerId: number;
  performedByOfficerName: string;
  performedByRole: string;
  performedAt: string;
  comments?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfficerCaseService {
  private apiUrl = `${environment.apiUrl}/cases`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken'); // Officers use adminToken
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  /**
   * Get cases assigned to current officer
   * GET /api/cases/my-cases
   */
  getMyCases(): Observable<ApiResponse<CaseDTO[]>> {
    return this.http.get<ApiResponse<CaseDTO[]>>(
      `${this.apiUrl}/my-cases`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching my cases:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get case details by ID
   * GET /api/cases/{caseId}
   */
  getCaseById(caseId: number): Observable<ApiResponse<CaseDTO>> {
    return this.http.get<ApiResponse<CaseDTO>>(
      `${this.apiUrl}/${caseId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error(`Error fetching case ${caseId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get available workflow transitions for a case
   * GET /api/cases/{caseId}/transitions
   */
  getAvailableTransitions(caseId: number): Observable<ApiResponse<WorkflowTransitionDTO[]>> {
    return this.http.get<ApiResponse<WorkflowTransitionDTO[]>>(
      `${this.apiUrl}/${caseId}/transitions`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error(`Error fetching transitions for case ${caseId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Execute a workflow transition
   * POST /api/cases/{caseId}/transitions/execute
   */
  executeTransition(caseId: number, request: ExecuteTransitionDTO): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${caseId}/transitions/execute`,
      request,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error(`Error executing transition for case ${caseId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get workflow history for a case
   * GET /api/cases/{caseId}/history
   */
  getWorkflowHistory(caseId: number): Observable<ApiResponse<WorkflowHistory[]>> {
    return this.http.get<ApiResponse<WorkflowHistory[]>>(
      `${this.apiUrl}/${caseId}/history`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error(`Error fetching workflow history for case ${caseId}:`, error);
        return throwError(() => error);
      })
    );
  }
}
