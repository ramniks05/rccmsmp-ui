import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CaseTypeService {

  private readonly baseUrl: string;
  private readonly caseTypesUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiUrl;
    this.caseTypesUrl = `${this.baseUrl}/case-types`;
  }

  getCaseTypes(): Observable<any> {
    return this.http.get<any>(this.caseTypesUrl, {
      headers: { accept: '*/*' }
    });
  }
}
