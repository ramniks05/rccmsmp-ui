import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * Admin Service
 * Handles all admin-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiUrl;
  }

  /**
   * Get authentication headers with admin token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ==================== Authentication ====================

  /**
   * Admin Login
   */
  adminLogin(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.baseUrl}/admin/auth/login`, { username, password }, { headers });
  }

  /**
   * Officer/DA Login
   */
  officerLogin(userid: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.baseUrl}/admin/auth/officer-login`, { userid, password }, { headers });
  }

  /**
   * Reset Password
   */
  resetPassword(userid: string, newPassword: string, confirmPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.baseUrl}/admin/auth/reset-password`, 
      { userid, newPassword, confirmPassword }, 
      { headers });
  }

  /**
   * Verify Mobile with OTP
   */
  verifyMobile(userid: string, otp: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.baseUrl}/admin/auth/verify-mobile`, 
      { userid, otp }, 
      { headers });
  }

  // ==================== Officer Management ====================

  /**
   * Create Officer
   */
  createOfficer(officer: { fullName: string; mobileNo: string; email: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/officers`, officer, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get All Officers
   */
  getAllOfficers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/officers`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Officer by ID
   */
  getOfficerById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/officers/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ==================== Posting Management ====================

  /**
   * Assign Officer to Post
   * Now uses courtId instead of unitId
   */
  assignOfficerToPost(posting: { courtId: number; roleCode: string; officerId: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/postings`, posting, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Transfer Officer
   * Now uses courtId instead of unitId
   */
  transferOfficer(posting: { courtId: number; roleCode: string; officerId: number }): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/postings/transfer`, posting, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Posting by UserID
   */
  getPostingByUserid(userid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/postings/userid/${userid}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Postings by Officer
   */
  getPostingsByOfficer(officerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/postings/officer/${officerId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Postings by Court
   */
  getPostingsByCourt(courtId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/postings/court/${courtId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Active Postings by Unit
   * Returns active postings for a unit (through courts)
   */
  getActivePostingsByUnit(unitId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/postings/unit/${unitId}/active`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get All Active Postings
   */
  getAllActivePostings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/postings/active`, {
      headers: this.getAuthHeaders()
    });
  }

  // ==================== Roles Management ====================

  /**
   * Get All Roles
   */
  getAllRoles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/roles`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Close Posting
   */
  closePosting(postingId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/postings/${postingId}/close`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // ==================== Administrative Units Management ====================

  /**
   * Create Administrative Unit
   */
  createAdminUnit(unit: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin-units`, unit, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get All Administrative Units
   */
  getAllAdminUnits(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin-units`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Active Administrative Units
   */
  getActiveAdminUnits(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin-units/active`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Administrative Units by Level
   */
  getAdminUnitsByLevel(level: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin-units/level/${level}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Administrative Units by Parent
   */
  getAdminUnitsByParent(parentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin-units/parent/${parentId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Root Units
   */
  getRootUnits(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin-units/root`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Administrative Unit by ID
   */
  getAdminUnitById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin-units/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Administrative Unit by Code
   */
  getAdminUnitByCode(code: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin-units/code/${code}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update Administrative Unit
   */
  updateAdminUnit(id: number, unit: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin-units/${id}`, unit, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete Administrative Unit
   */
  deleteAdminUnit(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin-units/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ==================== Case Types Management ====================

  /**
   * Create Case Type
   */
  createCaseType(caseType: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/case-types`, caseType, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get All Case Types
   */
  getAllCaseTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/case-types`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Active Case Types
   */
  getActiveCaseTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/case-types/active`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Case Type by ID
   */
  getCaseTypeById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/case-types/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Case Type by Code
   */
  getCaseTypeByCode(code: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/case-types/code/${code}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update Case Type
   */
  updateCaseType(id: number, caseType: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/case-types/${id}`, caseType, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete Case Type
   */
  deleteCaseType(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/case-types/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Hard Delete Case Type
   */
  hardDeleteCaseType(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/case-types/${id}/hard`, {
      headers: this.getAuthHeaders()
    });
  }

  // ==================== Form Schema Management ====================

  /**
   * Get Form Schema for Case Type
   */
  getFormSchema(caseTypeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/form-schemas/case-types/${caseTypeId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Validate Form Data
   */
  validateFormData(caseTypeId: number, formData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/form-schemas/validate`, {
      caseTypeId,
      formData
    }, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Save/Create Form Schema
   * TODO: Verify the actual API endpoint format
   */
  saveFormSchema(caseTypeId: number, schema: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/form-schemas/case-types/${caseTypeId}`, schema, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update Form Schema
   */
  updateFormSchema(caseTypeId: number, schema: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/form-schemas/case-types/${caseTypeId}`, schema, {
      headers: this.getAuthHeaders()
    });
  }

  // ==================== Form Field Management ====================

  /**
   * Get All Fields (Including Inactive)
   */
  getAllFormFields(caseTypeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/form-schemas/case-types/${caseTypeId}/fields`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Single Field by ID
   */
  getFormField(fieldId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/form-schemas/fields/${fieldId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Create a single form field
   */
  createFormField(field: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/form-schemas/fields`, field, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update a single form field
   */
  updateFormField(fieldId: number, field: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/form-schemas/fields/${fieldId}`, field, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete a single form field
   */
  deleteFormField(fieldId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/form-schemas/fields/${fieldId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Reorder fields
   */
  reorderFields(caseTypeId: number, fieldOrders: Array<{fieldId: number, displayOrder: number}>): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/form-schemas/case-types/${caseTypeId}/fields/reorder`, {
      fieldOrders
    }, {
      headers: this.getAuthHeaders()
    });
  }

  // ==================== Acts Management ====================

  /**
   * Get All Active Acts
   */
  getAllActs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/acts`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Act by ID
   */
  getActById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/acts/${id}`, {
      headers: this.getAuthHeaders()
    });
  }


  /**
   * Create Act
   */
  createAct(act: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/acts`, act, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update Act
   */
  updateAct(id: number, act: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/acts/${id}`, act, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete Act
   */
  deleteAct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/acts/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ==================== Case Natures Management ====================

  /**
   * Get All Case Natures
   */
  getAllCaseNatures(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/case-natures`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Case Natures by Case Type
   */
  getCaseNaturesByCaseType(caseTypeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/case-natures/case-type/${caseTypeId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Case Nature by ID
   */
  getCaseNatureById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/case-natures/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Create Case Nature
   */
  createCaseNature(caseNature: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/case-natures`, caseNature, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update Case Nature
   */
  updateCaseNature(id: number, caseNature: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/case-natures/${id}`, caseNature, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete Case Nature
   */
  deleteCaseNature(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/case-natures/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ==================== Courts Management ====================

  /**
   * Get All Courts
   */
  getAllCourts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/courts`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Courts by Level
   */
  getCourtsByLevel(level: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/courts/level/${level}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get Court by ID
   */
  getCourtById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/courts/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Create Court
   */
  createCourt(court: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/courts`, court, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update Court
   */
  updateCourt(id: number, court: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/courts/${id}`, court, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete Court
   */
  deleteCourt(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/courts/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ==================== Case Management ====================

  /**
   * Create Case
   */
  createCase(caseData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/cases`, caseData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Check if admin is authenticated
   */
  isAdminAuthenticated(): boolean {
    return !!localStorage.getItem('adminToken');
  }

  /**
   * Get admin token
   */
  getAdminToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  /**
   * Logout admin
   */
  logout(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUserData');
  }
}

