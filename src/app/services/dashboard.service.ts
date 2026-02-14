import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = 'http://127.0.0.1:8000/api/dashboard';
    private http = inject(HttpClient);

    getSummary(companyId: number, periodId: number): Observable<any> {
        let params = new HttpParams()
            .set('company_id', companyId.toString())
            .set('period_id', periodId.toString());

        return this.http.get(`${this.apiUrl}/summary`, { params });
    }

    getTrends(companyId: number): Observable<any> {
        let params = new HttpParams().set('company_id', companyId.toString());
        return this.http.get(`${this.apiUrl}/trends`, { params });
    }
}
