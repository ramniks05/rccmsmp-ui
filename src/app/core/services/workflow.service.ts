import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import type {
  TransitionChecklist,
  TransitionWithChecklist
} from '../models/workflow-condition.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

/**
 * Workflow service for case-level workflow APIs (checklist, available transitions).
 * Used on case detail page for "Available Actions" / checklist display.
 */
@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private readonly baseUrl = `${environment.apiUrl}/workflow`;

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
    if (userId != null) {
      headers['X-User-Id'] = String(userId);
    }
    return new HttpHeaders(headers);
  }

  /**
   * Get available transitions for a case (with checklist summary).
   * GET /api/workflow/cases/{caseId}/transitions
   */
  getCaseTransitions(caseId: number): Observable<ApiResponse<TransitionWithChecklist[]>> {
    return this.http.get<ApiResponse<TransitionWithChecklist[]>>(
      `${this.baseUrl}/cases/${caseId}/transitions`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get full checklist for a specific transition on a case.
   * GET /api/workflow/checklist/{caseId}/{transitionCode}
   */
  getTransitionChecklist(
    caseId: number,
    transitionCode: string
  ): Observable<ApiResponse<TransitionChecklist>> {
    return this.http.get<ApiResponse<TransitionChecklist>>(
      `${this.baseUrl}/checklist/${caseId}/${encodeURIComponent(transitionCode)}`,
      { headers: this.getHeaders() }
    );
  }
}
