import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ContextSelectorComponent } from '../context-selector/context-selector';

@Component({
  selector: 'app-dashboard-content',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, ContextSelectorComponent],
  template: `
    <div class="dashboard-content">
      <div class="filters-container">
        <app-context-selector></app-context-selector>
      </div>
      <h1>Huella Total: 967,52 tCO₂e</h1>
      <div class="grid-container">
        <!-- Placeholders for charts -->
        <div class="card">Alcance 1</div>
        <div class="card">Alcance 2</div>
        <div class="card">Alcance 3</div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-content {
      padding: 20px;
    }
    .filters-container {
      margin-bottom: 20px;
      display: flex;
      justify-content: flex-end;
    }
    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .card {
     background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      min-height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: #666;
    }
  `]
})
export class DashboardContentComponent { }
