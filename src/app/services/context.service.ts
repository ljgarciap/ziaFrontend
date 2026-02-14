import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ContextService {
    // Using Signals for reactive state
    selectedCompany = signal<any>(null);
    selectedPeriod = signal<any>(null);

    constructor() {
        // Attempt to hydrate from localStorage
        const savedCompany = localStorage.getItem('zia_selected_company');
        const savedPeriod = localStorage.getItem('zia_selected_period');

        if (savedCompany) this.selectedCompany.set(JSON.parse(savedCompany));
        if (savedPeriod) this.selectedPeriod.set(JSON.parse(savedPeriod));
    }

    setCompany(company: any) {
        this.selectedCompany.set(company);
        localStorage.setItem('zia_selected_company', JSON.stringify(company));

        // Clear period when company changes
        this.selectedPeriod.set(null);
        localStorage.removeItem('zia_selected_period');
    }

    setPeriod(period: any) {
        this.selectedPeriod.set(period);
        localStorage.setItem('zia_selected_period', JSON.stringify(period));
    }
}
