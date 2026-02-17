import { Component, inject, ChangeDetectorRef, ViewChildren, QueryList, AfterViewInit, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { MasterDataService } from '../../services/master-data.service';
import { ContextService } from '../../services/context.service';

@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Ítems por página:';
  override nextPageLabel = 'Siguiente página';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };
}

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ],
  templateUrl: './form.html',
  styleUrls: ['./form.css'],
})
export class FormComponent implements AfterViewInit {
  private http = inject(HttpClient);
  private masterDataService = inject(MasterDataService);
  private contextService = inject(ContextService);
  private cdr = inject(ChangeDetectorRef);

  // Context Selection
  companies: any[] = [];
  periods: any[] = [];
  selectedCompany: any;
  selectedPeriod: any;

  // Dynamic Data
  scopes: any[] = [];

  // General Info
  year = '2022';
  huella = '';
  showDebug = false; // Toggle for JSON debug

  // Data Store (MatTableDataSource)
  scope1DataSource = new MatTableDataSource<any>([]);
  scope2DataSource = new MatTableDataSource<any>([]);
  scope3DataSource = new MatTableDataSource<any>([]);

  get hasData(): boolean {
    return this.scope1DataSource.data.length > 0 ||
      this.scope2DataSource.data.length > 0 ||
      this.scope3DataSource.data.length > 0;
  }

  displayedColumns: string[] = ['source', 'quantity', 'totalCO2e', 'actions'];

  @ViewChildren(MatPaginator) paginators!: QueryList<MatPaginator>;

  ngOnInit() {
    this.loadMasterData();
    this.loadCompanies();

    const initialCompany = this.contextService.selectedCompany();
    if (initialCompany) {
      this.selectedCompany = initialCompany;
      this.loadPeriods(initialCompany.id);
    }
  }

  ngAfterViewInit() {
    // Assign paginators when they become available
    this.paginators.changes.subscribe(() => {
      this.linkPaginators();
    });
  }

  linkPaginators() {
    const paginatorArray = this.paginators.toArray();
    // Assuming order matches scopes 1, 2, 3 in the template
    // Note: Since they are in *ngSwitch, they might not all exist at once or order might vary.
    // However, the template iterates scopes generally.
    // Better strategy: Assign individually when access is needed or check array content.

    // For now, let's try to assign if they exist. 
    // Since scopes are rendered dynamically, we might need a more robust way if we had many scopes.
    // Given the template structure, we have paginators inside *ngSwitchCase.

    // We will assign manually in addEmission or assume order if all rendered.
    // Actually, with *ngSwitch, they are conditional. 
  }

  loadCompanies() {
    this.masterDataService.getCompanies().subscribe(data => {
      this.companies = data;
      if (this.selectedCompany) {
        const found = this.companies.find(c => c.id === this.selectedCompany.id);
        if (found) this.selectedCompany = found;
      }
      this.cdr.detectChanges();
    });
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  onCompanyChange(company: any) {
    this.selectedPeriod = null;
    this.periods = [];
    if (company) {
      this.loadPeriods(company.id);
    }
  }

  loadPeriods(companyId: number) {
    this.masterDataService.getPeriods(companyId).subscribe(data => {
      this.periods = data;
      const ctxPeriod = this.contextService.selectedPeriod();
      if (ctxPeriod && data.find((p: any) => p.id === ctxPeriod.id)) {
        this.selectedPeriod = ctxPeriod;
      }
      this.cdr.detectChanges();
    });
  }

  loadMasterData() {
    this.masterDataService.getEmissionFactors().subscribe((scopes: any[]) => {
      this.scopes = scopes.map(scope => ({
        ...scope,
        categories: scope.categories.map((cat: any) => this.processCategory(cat))
      }));
      this.cdr.detectChanges();
    });
  }

  processCategory(category: any): any {
    const processed = {
      ...category,
      selectedFactor: null,
      inputAmount: '',
      children: category.children ? category.children.map((child: any) => this.processCategory(child)) : []
    };

    if (processed.factors && processed.factors.length > 0 && processed.name.toLowerCase().includes('electricidad')) {
      processed.selectedFactor = processed.factors[0];
    }

    return processed;
  }

  private cleanQuantity(value: string | number): number {
    const cleaned = parseFloat(value.toString());
    return isNaN(cleaned) ? 0 : cleaned;
  }

  addEmission(category: any, scopeId: number) {
    if (!this.selectedCompany || !this.selectedPeriod) {
      alert('Por favor selecciona una Empresa y un Periodo antes de cargar datos.');
      return;
    }

    if (!category.selectedFactor || !category.inputAmount) return;

    const amount = this.cleanQuantity(category.inputAmount);
    const factor = category.selectedFactor;
    const totalCO2e = amount * parseFloat(factor.factor_total_co2e);

    const item = {
      type: category.name,
      subtype: factor.name,
      quantity: amount,
      unit: factor.unit?.symbol || factor.unit?.name || '',
      emissionFactorId: factor.id,
      totalCO2e: totalCO2e,
      source: category.name
    };

    if (scopeId === 1) {
      const data = this.scope1DataSource.data;
      data.unshift(item); // Add to top
      this.scope1DataSource.data = data;
      this.updatePaginator(this.scope1DataSource, 0);
    } else if (scopeId === 2) {
      const data = this.scope2DataSource.data;
      data.unshift(item);
      this.scope2DataSource.data = data;
      this.updatePaginator(this.scope2DataSource, 0); // Logic to find correct paginator needed if dynamic
    } else if (scopeId === 3) {
      const data = this.scope3DataSource.data;
      data.unshift(item);
      this.scope3DataSource.data = data;
      this.updatePaginator(this.scope3DataSource, 0);
    }

    category.selectedFactor = null;
    category.inputAmount = '';

    if (category.name.toLowerCase().includes('electricidad') && category.factors.length > 0) {
      category.selectedFactor = category.factors[0];
    }
  }

  // Helper to link paginator dynamically. 
  // In a real app with ngSwitch, we might need a more robust mapping. 
  // For now, since we only have 3 scopes, we can try to find them by associating with the scope index.
  // BUT: paginators query list includes ONLY rendered paginators.
  // Since scopes are in ngSwitch, usually only ONE is visible per scope iteration? 
  // No, the ngSwitch is inside the *ngFor of scopes. 
  // So for each scope in the loop, we render a table. ALL enabled scope tables are rendered if they have data.
  // We can just re-assign all paginators whenever we add data.

  updatePaginator(dataSource: MatTableDataSource<any>, scopeIndex: number) {
    // We need to wait for view update? 
    // The paginator should be in the view if data > 0.
    setTimeout(() => {
      // Simple heuristic: match paginator by order?
      // Or cleaner: Assign in HTML using template reference variable passed to function? 
      // We can't pass template ref easily to TS without @ViewChild.
      // Let's use the QueryList.

      // Since we have 3 potential tables, let's map them.
      // We need to know which paginator belongs to which scope.
      // It's tricky with QueryList order if some are missing.
      // Better approach: In HTML, simply use [dataSource]="scopeXDataSource" and <mat-paginator [length]="...">.
      // Actually MatTableDataSource automatically listens to paginator if assigned.
      // dataSource.paginator = paginator.

      const paginators = this.paginators.toArray();
      // This is fragile if we don't know the mapping.
      // Given complexity, let's just use a trick: 
      // We will assign the paginator in the template using a setter or method if possible? No.

      // Let's just try to assign ANY unassigned paginator or just match by scope ID if we can tag them.
      // Or simply: 
      if (dataSource === this.scope1DataSource && paginators.length > 0) {
        // Find the one inside scope 1 container? Can't easily tell.
        // Let's assume sequential order of rendered scopes.
        // Keep it simple: Reset all.
        this.assignPaginators();
      } else {
        this.assignPaginators();
      }
    });
  }

  assignPaginators() {
    const paginators = this.paginators.toArray();
    // This logic is tricky without deterministic ordering.
    // However, the *ngFor="let scope of scopes" renders them in order.
    // scope 1, then 2, then 3.
    // So paginators[0] should be Scope 1 (if visible), [1] Scope 2, etc.
    // BUT we only render the table `*ngIf="data.length > 0"`.

    let cleanPaginators = paginators.slice();

    if (this.scope1DataSource.data.length > 0 && cleanPaginators.length > 0) {
      this.scope1DataSource.paginator = cleanPaginators.shift() || null;
    }
    if (this.scope2DataSource.data.length > 0 && cleanPaginators.length > 0) {
      this.scope2DataSource.paginator = cleanPaginators.shift() || null;
    }
    if (this.scope3DataSource.data.length > 0 && cleanPaginators.length > 0) {
      this.scope3DataSource.paginator = cleanPaginators.shift() || null;
    }
  }

  removeEmission(item: any, scopeId: number) {
    if (scopeId === 1) {
      const data = this.scope1DataSource.data;
      const index = data.indexOf(item);
      if (index > -1) {
        data.splice(index, 1);
        this.scope1DataSource.data = data;
        this.assignPaginators();
      }
    } else if (scopeId === 2) {
      const data = this.scope2DataSource.data;
      const index = data.indexOf(item);
      if (index > -1) {
        data.splice(index, 1);
        this.scope2DataSource.data = data;
        this.assignPaginators();
      }
    } else if (scopeId === 3) {
      const data = this.scope3DataSource.data;
      const index = data.indexOf(item);
      if (index > -1) {
        data.splice(index, 1);
        this.scope3DataSource.data = data;
        this.assignPaginators();
      }
    }
  }

  onSubmit() {
    const apiData = {
      uid: 'CURRENT_USER_ID',
      data: {
        scope1: this.scope1DataSource.data,
        scope2: this.scope2DataSource.data,
        scope3: this.scope3DataSource.data
      }
    };
    console.log('Submitting Data:', apiData);
  }
}
