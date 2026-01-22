import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegistrationFormField {
  id?: number;
  registrationType: 'CITIZEN' | 'LAWYER';
  fieldName: string;
  fieldLabel: string;
  fieldType: 'TEXT' | 'EMAIL' | 'PHONE' | 'DATE' | 'DROPDOWN' | 'TEXTAREA' | 'NUMBER' | 'PASSWORD';
  isRequired: boolean;
  validationRules: string | null; // JSON string
  displayOrder: number;
  isActive: boolean;
  defaultValue: string | null;
  fieldOptions: string | null; // JSON string for dropdown options
  dataSource: string | null; // JSON string for dynamic data sources
  placeholder: string | null;
  helpText: string | null;
  fieldGroup: string | null;
  conditionalLogic: string | null; // JSON string
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationFormAdminService {
  private readonly baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiUrl;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * List all registration form fields for a specific type
   * GET /api/admin/registration-forms/{type}/fields
   */
  getRegistrationFormFields(type: 'CITIZEN' | 'LAWYER'): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/registration-forms/${type}/fields`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Create a new registration form field
   * POST /api/admin/registration-forms/fields
   */
  createRegistrationFormField(field: RegistrationFormField): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/registration-forms/fields`, field, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update an existing registration form field
   * PUT /api/admin/registration-forms/fields/{id}
   */
  updateRegistrationFormField(id: number, field: RegistrationFormField): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/registration-forms/fields/${id}`, field, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete a registration form field
   * DELETE /api/admin/registration-forms/fields/{id}
   */
  deleteRegistrationFormField(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/registration-forms/fields/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ==================== Field Groups Management ====================

  /**
   * Get field group options for dropdown
   * GET /api/admin/registration-forms/{type}/field-groups
   */
  getFieldGroupOptions(type: 'CITIZEN' | 'LAWYER'): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/registration-forms/${type}/field-groups`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * List all field groups
   * GET /api/admin/registration-forms/{type}/groups
   */
  getFieldGroups(type: 'CITIZEN' | 'LAWYER'): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/registration-forms/${type}/groups`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Create a new field group
   * POST /api/admin/registration-forms/groups
   */
  createFieldGroup(group: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/registration-forms/groups`, group, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update an existing field group
   * PUT /api/admin/registration-forms/groups/{id}
   */
  updateFieldGroup(id: number, group: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/registration-forms/groups/${id}`, group, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete a field group
   * DELETE /api/admin/registration-forms/groups/{id}
   */
  deleteFieldGroup(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/registration-forms/groups/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
