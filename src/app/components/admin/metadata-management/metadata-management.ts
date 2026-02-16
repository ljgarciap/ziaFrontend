import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AdminService } from '../../../services/admin.service';
import { CategoryDialog, FactorDialog, ConfirmDialog, FormulaDialog } from '../admin-dialogs';

@Component({
  selector: 'app-metadata-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  template: `
    <div class="management-page">
      <div class="header-section">
        <div class="title-group">
          <h1>Motor de Cálculo</h1>
          <p class="subtitle">Configura las categorías de emisión y actualiza los factores de conversión globales.</p>
        </div>
        <div class="header-actions">
           <button mat-button class="btn-outline-prestige" (click)="onCreateFormula()">
             <mat-icon>functions</mat-icon> Gestionar Fórmulas
           </button>
           <button mat-flat-button class="btn-prestige" (click)="onCreateCategory()">
             <mat-icon>add</mat-icon> Nueva Categoría
           </button>
        </div>
      </div>

      <!-- Formulas Section (Quick List) -->
      <div class="glass-card formulas-summary-card" *ngIf="formulas.length > 0">
        <div class="card-header-simple">
          <h3>Fórmulas de Cálculo Activas</h3>
          <span class="count-badge">{{formulas.length}}</span>
        </div>
        <div class="formulas-chips">
          <div class="formula-chip-premium" *ngFor="let f of formulas" (click)="onEditFormula(f)">
            <mat-icon>terminal</mat-icon>
            <span class="f-name">{{f.name}}</span>
            <span class="f-expr">{{f.expression}}</span>
          </div>
        </div>
      </div>

      <div class="filters-bar-prestige">
        <mat-form-field appearance="outline" class="search-field global-search">
          <mat-label>Búsqueda global de factores</mat-label>
          <input matInput (keyup)="applyGlobalFilter($event)" placeholder="Ej: Gas Natural o Energía" #input>
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <div class="spinner-container-prestige" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Cargando factores de emisión...</p>
      </div>

      <div class="category-grid">
        <div class="glass-card category-premium-card" *ngFor="let cat of filteredCategories">
          <div class="cat-brand-header">
              <div class="cat-ident">
                  <div class="scope-icon" [ngClass]="'scope-' + cat.scope">{{cat.scope}}</div>
                  <div class="cat-text">
                    <h3>{{cat.name}}</h3>
                    <span class="cat-meta">{{(cat.factors || []).length}} Factores vinculados</span>
                  </div>
              </div>
              <button mat-icon-button class="cat-action-btn" matTooltip="Agregar Factor" (click)="onCreateFactor(cat)">
                  <mat-icon>add_circle</mat-icon>
              </button>
          </div>
          
          <div class="table-container">
            <table mat-table [dataSource]="cat.dataSource" class="factors-premium-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Elemento / Actividad</th>
                <td mat-cell *matCellDef="let f" class="factor-name-td">
                  <div class="name-with-formula">
                    {{f.name}}
                    <span class="formula-tag-mini" *ngIf="f.calculation_formula_id">
                      <mat-icon>bolt</mat-icon> 
                      {{ getFormulaName(f.calculation_formula_id) }}
                    </span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="unit">
                <th mat-header-cell *matHeaderCellDef>Unidad</th>
                <td mat-cell *matCellDef="let f">
                  <span class="unit-tag">{{f.unit}}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="factor">
                <th mat-header-cell *matHeaderCellDef>Factores de Gas (kg/u)</th>
                <td mat-cell *matCellDef="let f" class="factor-value-td">
                  <div class="gases-breakdown" [matTooltip]="'CO2: ' + f.factor_co2 + ' | CH4: ' + f.factor_ch4 + ' | N2O: ' + f.factor_n2o + ' | NF3: ' + f.factor_nf3 + ' | SF6: ' + f.factor_sf6">
                    <span class="gas">CO₂: {{f.factor_co2}}</span>
                    <span class="gas-sep">|</span>
                    <span class="gas">CH₄: {{f.factor_ch4}}</span>
                    <span class="gas-sep">|</span>
                    <span class="gas">N₂O: {{f.factor_n2o}}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let f">
                  <div class="factor-actions">
                    <button mat-icon-button class="small-action-btn" (click)="onEditFactor(f)" matTooltip="Editar"><mat-icon>edit</mat-icon></button>
                    <button mat-icon-button class="small-action-btn warn" (click)="onDeleteFactor(f)" matTooltip="Eliminar"><mat-icon>delete_outline</mat-icon></button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="factor-row"></tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .management-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
    
    .header-section { 
      display: flex; justify-content: space-between; align-items: flex-end; 
      margin-bottom: 24px; gap: 20px;
    }
    .title-group h1 { 
      font-size: 28px; font-weight: 600; color: var(--prestige-primary); 
      margin: 0 0 4px 0; letter-spacing: -0.02em;
    }
    .subtitle { color: var(--prestige-text-muted); margin: 0; font-size: 14px; }

    .header-actions { display: flex; gap: 8px; }
    .btn-prestige { 
      background: var(--prestige-primary); color: white; padding: 0 20px; 
      border-radius: 10px; font-weight: 500; height: 42px; font-size: 14px;
    }
    .btn-outline-prestige { 
      border: 1.5px solid var(--prestige-primary); color: var(--prestige-primary); 
      padding: 0 20px; border-radius: 10px; font-weight: 600; height: 42px; font-size: 14px;
    }

    .formulas-summary-card { padding: 20px; margin-bottom: 24px; }
    .card-header-simple { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .card-header-simple h3 { margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--prestige-text-muted); }
    .count-badge { background: var(--prestige-primary); color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
    
    .formulas-chips { display: flex; flex-wrap: wrap; gap: 10px; }
    .formula-chip-premium { 
      display: flex; align-items: center; gap: 8px; padding: 8px 14px; 
      background: rgba(var(--prestige-primary-rgb), 0.05); border: 1px solid var(--prestige-border);
      border-radius: 12px; cursor: pointer; transition: all 0.2s;
    }
    .formula-chip-premium:hover { background: white; border-color: var(--prestige-primary); transform: translateY(-2px); }
    .formula-chip-premium mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--prestige-primary); }
    .f-name { font-weight: 600; font-size: 13px; }
    .f-expr { font-size: 11px; font-family: 'Monaco', monospace; color: var(--prestige-text-muted); border-left: 1px solid var(--prestige-border); padding-left: 8px; }

    .filters-bar-prestige { margin-bottom: 24px; margin-top: 8px; }
    .global-search { width: 100%; max-width: 400px; font-size: 13px; }

    .category-grid { display: flex; flex-direction: column; gap: 24px; }

    .category-premium-card { padding: 0; overflow: hidden; border: 1px solid var(--prestige-border); }
    
    .cat-brand-header { 
      padding: 14px 24px; display: flex; justify-content: space-between; align-items: center;
      background: var(--table-header-bg); border-bottom: 1px solid var(--prestige-border);
    }
    .cat-ident { display: flex; align-items: center; gap: 16px; }
    .scope-icon { 
      width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; 
      justify-content: center; font-weight: 800; font-size: 16px; color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .scope-1 { background: #1a237e; }
    .scope-2 { background: #00897b; }
    .scope-3 { background: #f59e0b; }

    .cat-text h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--prestige-text); }
    .cat-meta { font-size: 11px; color: var(--prestige-text-muted); font-weight: 500; }

    .cat-action-btn { color: var(--prestige-primary); width: 40px; height: 40px; }

    .factors-premium-table { width: 100%; min-width: 700px; background: transparent; }
    .table-container { width: 100%; overflow-x: auto; position: relative; }

    .factor-row { height: 64px; }
    .factor-row:hover { background: var(--row-hover-bg) !important; }
    
    .factor-name-td { font-weight: 500; color: var(--prestige-text); font-size: 13px; }
    .name-with-formula { display: flex; flex-direction: column; gap: 4px; }
    .formula-tag-mini { display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--prestige-primary); font-weight: 600; }
    .formula-tag-mini mat-icon { font-size: 12px; width: 12px; height: 12px; }

    .unit-tag { 
      background: var(--status-neutral-bg) !important; color: var(--status-neutral-text) !important; padding: 2px 8px; 
      border-radius: 6px; font-size: 10px; font-weight: 700; border: 1px solid var(--prestige-border);
    }
    .factor-value-td { font-family: 'Monaco', monospace; }
    .gases-breakdown { display: flex; gap: 8px; font-size: 11px; color: var(--prestige-text-muted); }
    .gas-sep { color: var(--prestige-border); }

    .factor-actions { display: flex; gap: 2px; }
    .small-action-btn { width: 32px; height: 32px; line-height: 32px; color: var(--prestige-text-muted); }
    .small-action-btn:hover { color: var(--prestige-primary); background: rgba(0,0,0,0.03); }
    .small-action-btn.warn:hover { color: #dc2626; background: #fff1f2; }

    .spinner-container-prestige { padding: 60px; text-align: center; color: var(--prestige-text-muted); font-size: 14px; }

    @media (max-width: 768px) {
      .management-page { padding: 16px; }
      .header-section { flex-direction: column; align-items: flex-start; gap: 16px; }
      .header-actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; }
      .global-search { max-width: 100%; }
      .factors-premium-table { min-width: 600px; }
    }
  `]
})
export class MetadataManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

  categories: any[] = [];
  formulas: any[] = [];
  filteredCategories: any[] = [];
  displayedColumns = ['name', 'unit', 'factor', 'actions'];
  loading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    // Load Formulas first, then categories
    this.adminService.getFormulas().subscribe({
      next: (fData) => {
        this.formulas = fData || [];
        this.loadMetadata();
      },
      error: () => this.loadMetadata()
    });
  }

  loadMetadata() {
    this.adminService.getCategories().subscribe({
      next: (data) => {
        this.categories = (data || []).map(cat => ({
          ...cat,
          dataSource: new MatTableDataSource(cat.factors || [])
        }));
        this.filteredCategories = [...this.categories];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Metadata] Error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getFormulaName(id: number): string {
    return this.formulas.find(f => f.id === id)?.name || 'Fórmula';
  }

  onCreateFormula() {
    const dialogRef = this.dialog.open(FormulaDialog, { data: {} });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.createFormula(result).subscribe(() => this.loadData());
      }
    });
  }

  onEditFormula(formula: any) {
    const dialogRef = this.dialog.open(FormulaDialog, { data: { ...formula } });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.updateFormula(formula.id, result).subscribe(() => this.loadData());
      }
    });
  }

  onCreateCategory() {
    const dialogRef = this.dialog.open(CategoryDialog, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.createCategory(result).subscribe(() => this.loadMetadata());
      }
    });
  }

  onCreateFactor(category: any) {
    const dialogRef = this.dialog.open(FactorDialog, {
      data: { factor: {}, formulas: this.formulas }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.createFactor({ ...result, emission_category_id: category.id }).subscribe(() => this.loadMetadata());
      }
    });
  }

  onEditFactor(factor: any) {
    const dialogRef = this.dialog.open(FactorDialog, {
      data: { factor: { ...factor }, formulas: this.formulas }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.updateFactor(factor.id, result).subscribe(() => this.loadMetadata());
      }
    });
  }

  onDeleteFactor(factor: any) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desactivar Factor',
        message: `¿Estás seguro de que deseas desactivar el factor "${factor.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Desactivar',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteFactor(factor.id).subscribe(() => this.loadMetadata());
      }
    });
  }

  applyGlobalFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();

    if (!filterValue) {
      this.filteredCategories = [...this.categories];
      return;
    }

    this.filteredCategories = this.categories.map(cat => {
      const filteredFactors = (cat.factors || []).filter((f: any) =>
        f.name.toLowerCase().includes(filterValue) ||
        cat.name.toLowerCase().includes(filterValue)
      );
      return {
        ...cat,
        dataSource: new MatTableDataSource(filteredFactors),
        factorsMatch: filteredFactors.length > 0
      };
    }).filter(cat => (cat as any).factorsMatch);
  }
}
