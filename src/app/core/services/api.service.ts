import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * API Service
 * Centralized service for making HTTP requests to the backend API
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiUrl;
  }

  /**
   * Get request
   * @param endpoint API endpoint (relative to baseUrl)
   * @param params Query parameters
   * @param headers Optional headers
   */
  get<T>(endpoint: string, params?: any, headers?: HttpHeaders): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      params: httpParams,
      headers: headers
    });
  }

  /**
   * Post request
   * @param endpoint API endpoint (relative to baseUrl)
   * @param body Request body
   * @param headers Optional headers
   */
  post<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { headers });
  }

  /**
   * Put request
   * @param endpoint API endpoint (relative to baseUrl)
   * @param body Request body
   * @param headers Optional headers
   */
  put<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, { headers });
  }

  /**
   * Delete request
   * @param endpoint API endpoint (relative to baseUrl)
   * @param headers Optional headers
   */
  delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, { headers });
  }

  /**
   * Placeholder HTTP call method for testing
   * @param endpoint API endpoint
   */
  testCall(endpoint: string): Observable<any> {
    return this.get(endpoint);
  }
}

