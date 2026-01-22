import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

export interface CaseType {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface FormField {
  id: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  displayOrder: number;
  placeholder?: string;
  defaultValue?: string;
  validationRules?: string;
}

export interface FormSchema {
  caseTypeId: number;
  caseTypeName: string;
  fields: FormField[];
}

export interface CaseSubmissionRequest {
  caseTypeId: number;
  unitId: number;
  subject: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  caseData: string; // JSON string
}

export interface Case {
  id: number;
  caseNumber: string;
  caseTypeId: number;
  applicantId: number;
  unitId: number;
  status: string;
  subject: string;
  description?: string;
  priority?: string;
  caseData?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CaseHistory {
  id: number;
  caseId: number;
  fromStateId?: number;
  toStateId?: number;
  fromState?: { stateCode: string; stateName: string };
  toState?: { stateCode: string; stateName: string };
  performedByRole?: string;
  comments?: string;
  performedAt: string;
}

export interface ResubmitRequest {
  caseData: string; // JSON string
  remarks?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitizenCaseService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const userData = this.authService.getUserData();
    const userId = userData?.userId;

    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (userId) {
      headers['X-User-Id'] = userId.toString();
    }

    return new HttpHeaders(headers);
  }

  // ==================== Case Type APIs ====================

  /**
   * Get active case types
   */
  getActiveCaseTypes(): Observable<ApiResponse<CaseType[]>> {
    return this.http.get<ApiResponse<CaseType[]>>(
      `${this.apiUrl}/case-types/active`
    );
  }

  /**
   * Get form schema for a case type
   */
  getFormSchema(caseTypeId: number): Observable<ApiResponse<FormSchema>> {
    return this.http.get<ApiResponse<FormSchema>>(
      `${this.apiUrl}/cases/form-schema/${caseTypeId}`
    );
  }

  // ==================== Case APIs ====================

  /**
   * Submit a new case
   */
  submitCase(request: CaseSubmissionRequest): Observable<ApiResponse<Case>> {
    return this.http.post<ApiResponse<Case>>(
      `${this.apiUrl}/cases`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get all cases for a citizen (applicant)
   */
  getCitizenCases(applicantId: number): Observable<ApiResponse<Case[]>> {
    return this.http.get<ApiResponse<Case[]>>(
      `${this.apiUrl}/cases/applicant/${applicantId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get case by ID
   */
  getCaseById(caseId: number): Observable<ApiResponse<Case>> {
    return this.http.get<ApiResponse<Case>>(
      `${this.apiUrl}/cases/${caseId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get workflow history for a case
   */
  getCaseHistory(caseId: number): Observable<ApiResponse<CaseHistory[]>> {
    return this.http.get<ApiResponse<CaseHistory[]>>(
      `${this.apiUrl}/cases/${caseId}/history`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Resubmit case after correction
   */
  resubmitCase(caseId: number, request: ResubmitRequest): Observable<ApiResponse<Case>> {
    return this.http.put<ApiResponse<Case>>(
      `${this.apiUrl}/cases/${caseId}/resubmit`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // ==================== Administrative Units (Public) ====================

  /**
   * Get active administrative units (for citizen case submission)
   * Note: This should be a public endpoint that doesn't require authentication
   */
  getActiveUnits(): Observable<ApiResponse<any[]>> {
    // Using public endpoint - no auth headers needed
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/admin-units/active`
    );
  }
}
