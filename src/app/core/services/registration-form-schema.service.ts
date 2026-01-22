import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegistrationFormField {
  id: number;
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

export interface RegistrationFormSchema {
  registrationType: 'CITIZEN' | 'LAWYER';
  fields: RegistrationFormField[];
}

export interface AdminUnit {
  unitId: number;
  unitCode: string;
  unitName: string;
  unitLevel: 'STATE' | 'DISTRICT' | 'SUB_DIVISION' | 'CIRCLE';
  parentUnitId: number | null;
  lgdCode: number;
  isActive: boolean;
}

export interface DataSourceConfig {
  type: 'ADMIN_UNITS';
  level: 'STATE' | 'DISTRICT' | 'SUB_DIVISION' | 'CIRCLE';
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationFormSchemaService {
  private apiUrl: string;
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl;
  }

  /**
   * Get registration form schema for a specific type (CITIZEN or LAWYER)
   */
  getRegistrationFormSchema(type: 'CITIZEN' | 'LAWYER'): Observable<any> {
    return this.http.get(`${this.apiUrl}/public/registration-forms/${type}`)
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError(error => {
          console.error('Error fetching registration form schema:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get root admin units (State level)
   */
  getRootUnits(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin-units/root`)
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError(error => {
          console.error('Error fetching root units:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get child units by parent ID
   */
  getChildUnitsByParent(parentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin-units/parent/${parentId}`)
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError(error => {
          console.error('Error fetching child units:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Parse validation rules from JSON string
   */
  parseValidationRules(rulesJson: string | null): any {
    if (!rulesJson) return {};
    try {
      return JSON.parse(rulesJson);
    } catch (e) {
      console.error('Error parsing validation rules:', e);
      return {};
    }
  }

  /**
   * Parse data source from JSON string
   */
  parseDataSource(dataSourceJson: string | null): DataSourceConfig | null {
    if (!dataSourceJson) return null;
    try {
      return JSON.parse(dataSourceJson);
    } catch (e) {
      console.error('Error parsing data source:', e);
      return null;
    }
  }

  /**
   * Parse field options from JSON string
   */
  parseFieldOptions(optionsJson: string | null): any[] {
    if (!optionsJson) return [];
    try {
      const parsed = JSON.parse(optionsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parsing field options:', e);
      return [];
    }
  }
}
