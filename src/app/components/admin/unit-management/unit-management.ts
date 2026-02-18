import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '../../../services/admin.service';
import { UnitDialog, ConfirmDialog } from '../admin-dialogs';

@Component({
    selector: 'app-unit-management',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatTooltipModule
    ],
    template: `
    <div class="management-page">
      <div class="header-section">
        <div class="title-group">
          <h1>Unidades de Medida</h1>
          <p class="subtitle">Gestiona las unidades disponibles para los factores de emisión (kg, kWh, gal, etc.)</p>
        </div>
        <button mat-flat-button class="btn-prestige" (click)="onCreate()">
          <mat-icon>add</mat-icon> Nueva Unidad
        </button>
      </div>

      <div class="glass-card">
        <table mat-table [dataSource]="dataSource" class="premium-table">
          
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let element"> {{element.name}} </td>
          </ng-container>

          <ng-container matColumnDef="symbol">
            <th mat-header-cell *matHeaderCellDef> Símbolo </th>
            <td mat-cell *matCellDef="let element"> <span class="unit-badge">{{element.symbol}}</span> </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Acciones </th>
            <td mat-cell *matCellDef="let element">
              <button mat-icon-button color="primary" (click)="onEdit(element)" matTooltip="Editar">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="onDelete(element)" matTooltip="Eliminar">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
    styles: [`
    .management-page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
    .title-group h1 { font-size: 28px; font-weight: 600; color: var(--prestige-primary); margin: 0; }
    .subtitle { color: var(--prestige-text-muted); margin-top: 5px; }
    
    .glass-card { 
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      border: 1px solid var(--prestige-border);
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    .premium-table { width: 100%; }
    .premium-table th { color: var(--prestige-text-muted); font-weight: 600; font-size: 13px; }
    .premium-table td { color: var(--prestige-text); font-size: 14px; }
    .premium-table tr:hover { background: rgba(0,0,0,0.02); }

    .unit-badge {
      background: #f1f5f9;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
      color: #334155;
      font-size: 12px;
      font-family: monospace;
    }

    .btn-prestige { 
      background: var(--prestige-primary); color: white; border-radius: 10px; height: 42px;
    }
  `]
})
export class UnitManagementComponent implements OnInit {
    private adminService = inject(AdminService);
    private dialog = inject(MatDialog);
    private cdr = inject(ChangeDetectorRef);

    dataSource = new MatTableDataSource<any>([]);
    displayedColumns = ['name', 'symbol', 'actions'];

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.adminService.getUnits().subscribe(data => {
            this.dataSource.data = data;
            this.cdr.detectChanges();
        });
    }

    onCreate() {
        const dialogRef = this.dialog.open(UnitDialog, { width: '400px', data: {} });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.adminService.createUnit(result).subscribe(() => this.loadData());
            }
        });
    }

    onEdit(unit: any) {
        const dialogRef = this.dialog.open(UnitDialog, { width: '400px', data: { ...unit } });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.adminService.updateUnit(unit.id, result).subscribe(() => this.loadData());
            }
        });
    }

    onDelete(unit: any) {
        const dialogRef = this.dialog.open(ConfirmDialog, {
            data: {
                title: 'Eliminar Unidad',
                message: `¿Estás seguro de eliminar "${unit.name}"?`,
                confirmText: 'Eliminar',
                color: 'warn'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.adminService.deleteUnit(unit.id).subscribe({
                    next: () => this.loadData(),
                    error: (err) => alert('No se puede eliminar: Probablemente esté en uso.')
                });
            }
        });
    }
}
