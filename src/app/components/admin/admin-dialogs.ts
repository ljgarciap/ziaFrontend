import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-company-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="zia-dialog-premium">
      <h2 mat-dialog-title>{{ data.id ? 'Editar Empresa' : 'Nueva Empresa' }}</h2>
      <mat-dialog-content>
        <form [formGroup]="form" (ngSubmit)="onSave()" class="zia-form-compact">
          <mat-form-field appearance="outline">
            <mat-label>Nombre de la Empresa</mat-label>
            <input matInput formControlName="name" placeholder="Ej: Zia Corp">
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>NIT</mat-label>
            <input matInput formControlName="nit" placeholder="Ej: 900.123.456-1">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Sector</mat-label>
            <input matInput formControlName="sector" placeholder="Ej: Energía, Manufactura">
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="onSave()">
          {{ data.id ? 'Actualizar' : 'Crear Empresa' }}
        </button>
      </mat-dialog-actions>
    </div>
  `
})
export class CompanyDialog {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CompanyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      name: [data.name || '', Validators.required],
      nit: [data.nit || '', Validators.required],
      sector: [data.sector || '']
    });
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="zia-dialog-premium">
      <h2 mat-dialog-title>{{ data.id ? 'Editar Perfil' : 'Invitar Usuario' }}</h2>
      <mat-dialog-content>
        <form [formGroup]="form" class="zia-form-compact">
          <div class="zia-form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Nombre Completo</mat-label>
              <input matInput formControlName="name">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Correo Electrónico</mat-label>
              <input matInput formControlName="email">
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Rol / Nivel de Acceso</mat-label>
            <mat-select formControlName="role">
              <mat-option value="user">Usuario</mat-option>
              <mat-option value="admin">Administrador</mat-option>
              <mat-option value="superadmin">Super Admin</mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="onSave()">
          {{ data.id ? 'Guardar Cambios' : 'Enviar Invitación' }}
        </button>
      </mat-dialog-actions>
    </div>
  `
})
export class UserDialog {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      name: [data.name || '', Validators.required],
      email: [data.email || '', [Validators.required, Validators.email]],
      role: [data.role || 'user', Validators.required]
    });
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-factor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="zia-dialog-premium">
      <h2 mat-dialog-title>{{ data.id ? 'Ajustar Factor' : 'Nuevo Factor' }}</h2>
      <mat-dialog-content>
        <form [formGroup]="form" class="zia-form-compact">
          <mat-form-field appearance="outline">
            <mat-label>Nombre del Elemento o Actividad</mat-label>
            <input matInput formControlName="name">
          </mat-form-field>
          
          <div class="zia-form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Unidad</mat-label>
              <input matInput formControlName="unit" placeholder="Ej: kWh, gal, m3">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Factor de Emisión</mat-label>
              <input matInput type="number" formControlName="factor_total_co2e">
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="onSave()">
          Confirmar
        </button>
      </mat-dialog-actions>
    </div>
  `
})
export class FactorDialog {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FactorDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      name: [data.name || '', Validators.required],
      unit: [data.unit || '', Validators.required],
      factor_total_co2e: [data.factor_total_co2e || 0, [Validators.required, Validators.min(0)]]
    });
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="zia-dialog-premium">
      <h2 mat-dialog-title>Nueva Categoría</h2>
      <mat-dialog-content>
        <form [formGroup]="form" class="zia-form-compact">
          <mat-form-field appearance="outline">
            <mat-label>Nombre de la Categoría</mat-label>
            <input matInput formControlName="name" placeholder="Ej: Combustibles Fósiles">
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Alcance (Scope)</mat-label>
            <mat-select formControlName="scope">
              <mat-optgroup label="Emisiones Directas">
                <mat-option [value]="1">Alcance 1 (Combustibles, Fugas...)</mat-option>
              </mat-optgroup>
              <mat-optgroup label="Emisiones Indirectas de Energía">
                <mat-option [value]="2">Alcance 2 (Consumo Eléctrico)</mat-option>
              </mat-optgroup>
              <mat-optgroup label="Otras Emisiones Indirectas">
                <mat-option [value]="3">Alcance 3 (Proveedores, Viajes...)</mat-option>
              </mat-optgroup>
            </mat-select>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="onSave()">
          Crear Categoría
        </button>
      </mat-dialog-actions>
    </div>
  `
})
export class CategoryDialog {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CategoryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      scope: [1, Validators.required]
    });
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="zia-dialog-premium confirmation">
      <h2 mat-dialog-title>{{data.title || '¿Estás seguro?'}}</h2>
      <mat-dialog-content>
        <p>{{data.message}}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">{{data.cancelText || 'Cancelar'}}</button>
        <button mat-flat-button [color]="data.color || 'warn'" (click)="onConfirm()">
          {{data.confirmText || 'Confirmar'}}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation p { margin: 0; color: var(--prestige-text-muted); font-size: 14px; line-height: 1.5; }
  `]
})
export class ConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
