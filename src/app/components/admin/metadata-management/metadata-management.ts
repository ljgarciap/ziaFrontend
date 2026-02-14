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
import { AdminService } from '../../../services/admin.service';

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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="management-page">
      <div class="header-section">
        <div class="title-group">
          <h1>Motor de Cálculo</h1>
          <p class="subtitle">Configura las categorías de emisión y actualiza los factores de conversión globales.</p>
        </div>
        <div class="header-actions">
           <button mat-button class="btn-outline-prestige">
             <mat-icon>upload_file</mat-icon> Importar Masivo
           </button>
           <button mat-flat-button class="btn-prestige">
             <mat-icon>add</mat-icon> Nueva Categoría
           </button>
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
              <button mat-icon-button class="cat-action-btn" matTooltip="Agregar Factor">
                  <mat-icon>add_circle</mat-icon>
              </button>
          </div>
          
          <div class="table-container">
            <table mat-table [dataSource]="cat.dataSource" class="factors-premium-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Elemento / Actividad</th>
                <td mat-cell *matCellDef="let f" class="factor-name-td">{{f.name}}</td>
              </ng-container>

              <ng-container matColumnDef="unit">
                <th mat-header-cell *matHeaderCellDef>Unidad</th>
                <td mat-cell *matCellDef="let f">
                  <span class="unit-tag">{{f.unit}}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="factor">
                <th mat-header-cell *matHeaderCellDef>Factor (kgCO₂e/u)</th>
                <td mat-cell *matCellDef="let f" class="factor-value-td">{{f.factor_total_co2e | number:'1.4-4'}}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let f">
                  <div class="factor-actions">
                    <button mat-icon-button class="small-action-btn" matTooltip="Editar"><mat-icon>edit</mat-icon></button>
                    <button mat-icon-button class="small-action-btn warn" matTooltip="Desactivar"><mat-icon>delete_outline</mat-icon></button>
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

    .filters-bar-prestige { margin-bottom: 24px; }
    .global-search { width: 100%; max-width: 400px; font-size: 13px; }

    .category-grid { display: flex; flex-direction: column; gap: 24px; }

    .category-premium-card { padding: 0; overflow: hidden; border: 1px solid var(--prestige-border); }
    
    .cat-brand-header { 
      padding: 14px 24px; display: flex; justify-content: space-between; align-items: center;
      background: #fcfcfd; border-bottom: 1px solid var(--prestige-border);
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
    .table-container { 
      width: 100%; 
      overflow-x: auto; 
      position: relative;
    }

    .factor-row { height: 48px; }
    .factor-row:hover { background: #fafbfc !important; }
    
    .factor-name-td { font-weight: 500; color: var(--prestige-text); font-size: 13px; }
    .unit-tag { 
      background: #f1f5f9; color: var(--prestige-text-muted); padding: 2px 8px; 
      border-radius: 6px; font-size: 10px; font-weight: 700; border: 1px solid #e2e8f0;
    }
    .factor-value-td { font-family: 'Monaco', monospace; font-weight: 600; color: var(--prestige-primary); font-size: 12px; }

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

  categories: any[] = [];
  filteredCategories: any[] = [];
  displayedColumns = ['name', 'unit', 'factor', 'actions'];
  loading = true;

  ngOnInit() {
    this.loadMetadata();
  }

  loadMetadata() {
    this.loading = true;
    console.log('[Metadata] Cargando factores...');
    this.adminService.getCategories().subscribe({
      next: (data) => {
        console.log('[Metadata] Catégorias recibidas:', data);
        this.categories = (data || []).map(cat => ({
          ...cat,
          dataSource: new MatTableDataSource(cat.factors || [])
        }));
        this.filteredCategories = [...this.categories];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Metadata] Error de carga:', err);
        this.loading = false;
        this.cdr.detectChanges();
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
