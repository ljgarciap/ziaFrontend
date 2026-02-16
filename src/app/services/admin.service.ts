import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = 'http://127.0.0.1:8000/api/admin';
    private http = inject(HttpClient);

    // Companies & Periods
    getCompanies(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/companies`);
    }

    createCompany(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/companies`, data);
    }

    updateCompany(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/companies/${id}`, data);
    }

    deleteCompany(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/companies/${id}`);
    }

    addPeriod(companyId: number, data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/companies/${companyId}/periods`, data);
    }

    updatePeriod(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/periods/${id}`, data);
    }

    deletePeriod(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/periods/${id}`);
    }

    // Users
    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users`);
    }

    createUser(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/users`, data);
    }

    updateUser(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/users/${id}`, data);
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/users/${id}`);
    }

    // Master Data (SuperAdmin)
    getCategories(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/categories`);
    }

    createCategory(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/categories`, data);
    }

    deleteCategory(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/categories/${id}`);
    }

    getFactors(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/factors`);
    }

    createFactor(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/factors`, data);
    }

    updateFactor(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/factors/${id}`, data);
    }

    deleteFactor(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/factors/${id}`);
    }

    // Sectors
    getSectors(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/sectors`);
    }

    createSector(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/sectors`, data);
    }

    updateSector(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/sectors/${id}`, data);
    }

    deleteSector(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/sectors/${id}`);
    }

    // Formulas
    getFormulas(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/formulas`);
    }

    createFormula(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/formulas`, data);
    }

    updateFormula(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/formulas/${id}`, data);
    }

    deleteFormula(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/formulas/${id}`);
    }
}
