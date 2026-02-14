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
  selector: 'app-user-management',
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
          <h1>Control de Accesos</h1>
          <p class="subtitle">Gestiona los permisos y roles de los integrantes de la plataforma.</p>
        </div>
        <button mat-flat-button class="btn-prestige">
          <mat-icon>person_add</mat-icon> Invitar Usuario
        </button>
      </div>

      <div class="glass-card table-wrapper">
        <div class="table-header">
           <mat-form-field appearance="outline" class="search-field prestige-field">
              <mat-label>Filtrar por nombre o correo</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Ej: info@zia.com" #input>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
        </div>

        <div class="spinner-container" *ngIf="loading">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Obteniendo usuarios...</p>
        </div>

        <div class="table-container">
          <table mat-table [dataSource]="dataSource" class="prestige-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Usuario</th>
              <td mat-cell *matCellDef="let user">
                 <div class="user-profile-cell">
                    <div class="avatar-prestige" [style.background]="getAvatarColor(user.role)">
                      {{user.name?.charAt(0) || '?'}}
                    </div>
                    <div class="user-info">
                      <span class="full-name">{{user.name}}</span>
                      <span class="user-email">{{user.email}}</span>
                    </div>
                 </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Correo</th>
              <td mat-cell *matCellDef="let user">{{user.email}}</td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Nivel</th>
              <td mat-cell *matCellDef="let user">
                <div class="role-chip" [ngClass]="user.role">
                  {{ user.role === 'superadmin' ? 'Super Admin' : (user.role === 'admin' ? 'Administrador' : 'Usuario') }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let user">
                   <div class="status-badge-premium" [class.active]="!user.deleted_at">
                      {{ user.deleted_at ? 'Inactivo' : 'Activo' }}
                   </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let user">
                <div class="action-buttons">
                  <button mat-icon-button class="action-btn edit" matTooltip="Editar Perfil"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button class="action-btn delete" *ngIf="!user.deleted_at" (click)="onDelete(user)" matTooltip="Suspender">
                    <mat-icon>person_off</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="prestige-row"></tr>
            
            <tr class="mat-row empty-state-row" *matNoDataRow>
              <td class="mat-cell" colspan="5">
                 <p *ngIf="!loading">No se encontraron resultados para su búsqueda.</p>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .management-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
    
    .header-section { 
      display: flex; justify-content: space-between; align-items: flex-end; 
      margin-bottom: 32px; gap: 20px;
    }
    .title-group h1 { 
      font-size: 28px; font-weight: 600; color: var(--prestige-primary); 
      margin: 0 0 4px 0; letter-spacing: -0.02em;
    }
    .subtitle { color: var(--prestige-text-muted); margin: 0; font-size: 14px; }

    .btn-prestige { 
      background: var(--prestige-primary); color: white; padding: 0 20px; 
      border-radius: 10px; font-weight: 500; height: 42px; font-size: 14px;
    }

    .table-wrapper { padding: 0; overflow-x: auto; }
    
    .table-header { 
      padding: 16px 24px; border-bottom: 1px solid var(--prestige-border);
    }
    .search-field { width: 300px; margin-bottom: -1.25em; font-size: 13px; }

    .prestige-table { width: 100%; min-width: 800px; }
    .table-container { 
      width: 100%; 
      overflow-x: auto; 
      position: relative;
      min-height: 200px;
    }

    .user-profile-cell { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
    .avatar-prestige { 
      width: 36px; height: 36px; border-radius: 50%; color: white; 
      display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .user-info { display: flex; flex-direction: column; }
    .full-name { font-weight: 600; color: var(--prestige-text); font-size: 14px; }
    .user-email { font-size: 12px; color: var(--prestige-text-muted); }

    .role-chip { 
      padding: 4px 12px; border-radius: 30px; font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.03em; border: 1px solid transparent;
      width: fit-content;
    }
    .role-chip.superadmin { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
    .role-chip.admin { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
    .role-chip.user { background: #f3f4f6; color: #374151; border-color: #e5e7eb; }

    .status-badge-premium { 
      padding: 3px 10px; border-radius: 6px; font-size: 10px; font-weight: bold;
      background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; width: fit-content;
    }
    .status-badge-premium.active { background: #ecfdf5; color: #065f46; border-color: #d1fae5; }

    .action-buttons { display: flex; gap: 4px; }
    .action-btn { color: var(--prestige-text-muted); width: 36px; height: 36px; }
    .action-btn:hover { background: rgba(0,0,0,0.03); }
    .action-btn.edit:hover { color: var(--prestige-primary); }
    .action-btn.delete:hover { color: #dc2626; }

    .spinner-container { padding: 48px; text-align: center; color: var(--prestige-text-muted); font-size: 14px; }
    .empty-state-row td { padding: 40px; text-align: center; color: var(--prestige-text-muted); }

    @media (max-width: 768px) {
      .management-page { padding: 16px; }
      .header-section { flex-direction: column; align-items: flex-start; gap: 16px; }
      .search-field { width: 100%; }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns = ['name', 'email', 'role', 'status', 'actions'];
  loading = true;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    console.log('[UserMgmt] Sincronizando usuarios...');
    this.adminService.getUsers().subscribe({
      next: (data) => {
        console.log('[UserMgmt] Datos recibidos:', data);
        this.dataSource.data = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[UserMgmt] Error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getAvatarColor(role: string): string {
    switch (role) {
      case 'superadmin': return '#ef4444';
      case 'admin': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  onDelete(user: any) {
    if (confirm(`¿Desactivar usuario ${user.email}?`)) {
      this.adminService.deleteUser(user.id).subscribe(() => this.loadUsers());
    }
  }
}
