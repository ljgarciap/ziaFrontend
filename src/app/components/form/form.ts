import { Component, inject } from '@angular/core';
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
import { HttpClient } from '@angular/common/http';
import { MasterDataService } from '../../services/master-data.service';
import { ContextService } from '../../services/context.service';

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
    MatCardModule
  ],
  templateUrl: './form.html',
  styleUrls: ['./form.css'],
})
export class FormComponent {
  private http = inject(HttpClient);
  private masterDataService = inject(MasterDataService);
  private contextService = inject(ContextService);

  // Context Selection
  companies: any[] = [];
  periods: any[] = [];
  selectedCompany: any;
  selectedPeriod: any;

  // Dynamic Lists
  liquidFuels: any[] = [];
  gaseousFuels: any[] = [];
  refrigerants: any[] = [];
  extinguishers: any[] = [];
  lubricants: any[] = [];

  fixedSolidFuels: any[] = [];
  fixedLiquidFuels: any[] = [];
  fixedGaseousFuels: any[] = [];

  selectedFixedRefrigerant: any;
  fixedRefrigerantConsumption = '';

  selectedFixedExtinguisher: any;
  fixedExtinguisherConsumption = '';

  selectedFixedLubricant: any;
  fixedLubricantConsumption = '';

  electricityFactors: any[] = [];
  selectedElectricityFactor: any;

  ngOnInit() {
    this.loadMasterData();
    this.loadCompanies();

    // Initialize from global context if available
    const initialCompany = this.contextService.selectedCompany();
    if (initialCompany) {
      this.selectedCompany = initialCompany;
      this.loadPeriods(initialCompany.id);
    }
  }

  loadCompanies() {
    this.masterDataService.getCompanies().subscribe(data => {
      this.companies = data;
    });
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
      // Auto-select if context period matches
      const ctxPeriod = this.contextService.selectedPeriod();
      if (ctxPeriod && data.find((p: any) => p.id === ctxPeriod.id)) {
        this.selectedPeriod = ctxPeriod;
      }
    });
  }

  loadMasterData() {
    this.masterDataService.getEmissionFactors().subscribe((categories: any[]) => {
      // Reset lists before populating
      this.liquidFuels = [];
      this.gaseousFuels = [];
      this.refrigerants = [];
      this.extinguishers = [];
      this.lubricants = [];
      this.fixedSolidFuels = [];
      this.fixedLiquidFuels = [];
      this.fixedGaseousFuels = [];
      this.electricityFactors = [];

      categories.forEach((cat: any) => {
        const name = cat.name.toLowerCase();

        // Mobile Sources
        if (name.includes('móviles') && name.includes('combustibles')) {
          this.liquidFuels = cat.factors;
        }
        if (name.includes('móviles') && name.includes('gases')) {
          this.gaseousFuels = cat.factors;
        }
        if (name.includes('refrigerantes')) {
          this.refrigerants = cat.factors;
        }
        if (name.includes('móviles') && name.includes('extintores')) {
          this.extinguishers = cat.factors;
        }
        if (name.includes('móviles') && name.includes('lubricantes')) {
          this.lubricants = cat.factors;
        }

        // Fixed Sources
        if (name.includes('fijas') && name.includes('sólidos')) {
          this.fixedSolidFuels = cat.factors;
        }
        if (name.includes('fijas') && name.includes('líquidos')) {
          this.fixedLiquidFuels = cat.factors;
        }
        if (name.includes('fijas') && name.includes('gaseosos')) {
          this.fixedGaseousFuels = cat.factors;
        }

        // Scope 2
        if (cat.scope === '2' || name.includes('electricidad')) {
          this.electricityFactors = cat.factors;
          if (this.electricityFactors.length > 0 && !this.selectedElectricityFactor) {
            this.selectedElectricityFactor = this.electricityFactors[0];
          }
        }
      });
    });
  }

  // General Info
  year = '2022';
  huella = '';

  // Data Store (Accumulated data to send)
  scope1Data: any[] = [];
  scope2Data: any[] = [];
  scope3Data: any[] = [];


  // --- Helper to clean quantities ---
  private cleanQuantity(value: string | number): number {
    const cleaned = parseFloat(value.toString());
    return isNaN(cleaned) ? 0 : cleaned;
  }

  // --- Scope 1: Mobile Sources ---

  // Liquid Fuels
  selectedLiquidFuel: any; // The entire object from dropdown
  liquidFuelConsumption = '';

  addLiquidFuel() {
    if (!this.selectedLiquidFuel || !this.liquidFuelConsumption) return;
    const amount = this.cleanQuantity(this.liquidFuelConsumption);

    // Calculate based on factor
    const totalCO2e = amount * parseFloat(this.selectedLiquidFuel.factor_total_co2e);

    const item = {
      type: 'fuel',
      source: 'mobile_liquid',
      subtype: this.selectedLiquidFuel.name,
      quantity: amount,
      unit: this.selectedLiquidFuel.unit,
      emissionFactorId: this.selectedLiquidFuel.id,
      totalCO2e: totalCO2e
    };

    this.scope1Data.push(item);
    this.selectedLiquidFuel = null;
    this.liquidFuelConsumption = '';
  }

  // Gaseous Fuels
  selectedGaseousFuel: any;
  gaseousFuelConsumption = '';

  addGaseousFuel() {
    if (!this.selectedGaseousFuel || !this.gaseousFuelConsumption) return;
    const amount = this.cleanQuantity(this.gaseousFuelConsumption);

    // Calculate based on factor
    const totalCO2e = amount * parseFloat(this.selectedGaseousFuel.factor_total_co2e);

    const item = {
      type: 'naturalGas', // Generic type for frontend logic if needed, or stick to 'fuel'
      source: 'mobile_gaseous',
      subtype: this.selectedGaseousFuel.name,
      quantity: amount,
      unit: this.selectedGaseousFuel.unit,
      emissionFactorId: this.selectedGaseousFuel.id,
      totalCO2e: totalCO2e
    };

    this.scope1Data.push(item);
    this.selectedGaseousFuel = null;
    this.gaseousFuelConsumption = '';
  }

  // Refrigerants
  selectedRefrigerant: any;
  refrigerantConsumption = '';

  addRefrigerant() {
    if (!this.selectedRefrigerant || !this.refrigerantConsumption) return;
    const amount = this.cleanQuantity(this.refrigerantConsumption);

    // Calculate based on factor
    const totalCO2e = amount * parseFloat(this.selectedRefrigerant.factor_total_co2e);

    const item = {
      type: 'refrigerant',
      source: 'mobile_refrigerant', // Or fixed, logic might need split
      subtype: this.selectedRefrigerant.name,
      quantity: amount,
      unit: this.selectedRefrigerant.unit,
      emissionFactorId: this.selectedRefrigerant.id,
      totalCO2e: totalCO2e
    };

    this.scope1Data.push(item);
    this.selectedRefrigerant = null;
    this.refrigerantConsumption = '';
  }

  // Extinguishers
  selectedExtinguisher: any;
  extinguisherConsumption = '';

  addExtinguisher() {
    if (!this.selectedExtinguisher || !this.extinguisherConsumption) return;
    const amount = this.cleanQuantity(this.extinguisherConsumption);

    // Calculate based on factor
    const totalCO2e = amount * parseFloat(this.selectedExtinguisher.factor_total_co2e);

    const item = {
      type: 'extinguisher',
      source: 'mobile_extinguisher',
      subtype: this.selectedExtinguisher.name,
      quantity: amount,
      unit: this.selectedExtinguisher.unit,
      emissionFactorId: this.selectedExtinguisher.id,
      totalCO2e: totalCO2e
    };

    this.scope1Data.push(item);
    this.selectedExtinguisher = null;
    this.extinguisherConsumption = '';
  }

  // Lubricants
  selectedLubricant: any;
  lubricantConsumption = '';

  addLubricant() {
    if (!this.selectedLubricant || !this.lubricantConsumption) return;
    const amount = this.cleanQuantity(this.lubricantConsumption);

    // Calculate based on factor
    const totalCO2e = amount * parseFloat(this.selectedLubricant.factor_total_co2e);

    const item = {
      type: 'lubricant',
      source: 'mobile_lubricant',
      subtype: this.selectedLubricant.name,
      quantity: amount,
      unit: this.selectedLubricant.unit,
      emissionFactorId: this.selectedLubricant.id,
      totalCO2e: totalCO2e
    };

    this.scope1Data.push(item);
    this.selectedLubricant = null;
    this.lubricantConsumption = '';
  }

  // --- Scope 1: Fixed Sources ---

  // Fixed Solid Fuels
  selectedFixedSolid: any;
  fixedsolidFuelConsumption = '';

  addFixedSolidFuel() {
    if (this.selectedFixedSolid && this.fixedsolidFuelConsumption) {
      const amount = this.cleanQuantity(this.fixedsolidFuelConsumption);
      const totalCO2e = amount * parseFloat(this.selectedFixedSolid.factor_total_co2e);

      this.scope1Data.push({
        type: 'solid_fuel',
        subtype: this.selectedFixedSolid.name,
        quantity: amount,
        source: 'fixed_solid',
        emissionFactorId: this.selectedFixedSolid.id,
        totalCO2e: totalCO2e
      });
      this.selectedFixedSolid = null; this.fixedsolidFuelConsumption = '';
    }
  }

  // Fixed Liquid Fuels
  selectedFixedLiquid: any;
  fixedLiquidFuelConsumption = '';

  addFixedLiquidFuel() {
    if (this.selectedFixedLiquid && this.fixedLiquidFuelConsumption) {
      const amount = this.cleanQuantity(this.fixedLiquidFuelConsumption);
      // Assuming unit in DB is Gal, no conversion needed if input is Gal. 
      // If input is Liters and DB is Gal, conversion needed. Assuming matching units for MVP.
      const totalCO2e = amount * parseFloat(this.selectedFixedLiquid.factor_total_co2e);

      this.scope1Data.push({
        type: 'liquid_fuel',
        subtype: this.selectedFixedLiquid.name,
        quantity: amount,
        source: 'fixed_liquid',
        emissionFactorId: this.selectedFixedLiquid.id,
        totalCO2e: totalCO2e
      });
      this.selectedFixedLiquid = null; this.fixedLiquidFuelConsumption = '';
    }
  }

  // Fixed Gaseous Fuels
  selectedFixedGaseous: any;
  fixedGaseousFuelConsumption = '';

  addFixedGaseousFuel() {
    if (this.selectedFixedGaseous && this.fixedGaseousFuelConsumption) {
      const amount = this.cleanQuantity(this.fixedGaseousFuelConsumption);
      const totalCO2e = amount * parseFloat(this.selectedFixedGaseous.factor_total_co2e);

      this.scope1Data.push({
        type: 'gaseous_fuel',
        subtype: this.selectedFixedGaseous.name,
        quantity: amount,
        source: 'fixed_gaseous',
        emissionFactorId: this.selectedFixedGaseous.id,
        totalCO2e: totalCO2e
      });
      this.selectedFixedGaseous = null; this.fixedGaseousFuelConsumption = '';
    }
  }

  // Fixed Refrigerants
  addFixedRefrigerant() {
    if (!this.selectedFixedRefrigerant || !this.fixedRefrigerantConsumption) return;
    const amount = this.cleanQuantity(this.fixedRefrigerantConsumption);
    const totalCO2e = amount * parseFloat(this.selectedFixedRefrigerant.factor_total_co2e);

    this.scope1Data.push({
      type: 'refrigerant',
      subtype: this.selectedFixedRefrigerant.name,
      quantity: amount,
      unit: this.selectedFixedRefrigerant.unit,
      source: 'fixed_refrigerant',
      emissionFactorId: this.selectedFixedRefrigerant.id,
      totalCO2e: totalCO2e
    });

    this.selectedFixedRefrigerant = null;
    this.fixedRefrigerantConsumption = '';
  }

  // Fixed Extinguishers
  addFixedExtinguisher() {
    if (!this.selectedFixedExtinguisher || !this.fixedExtinguisherConsumption) return;
    const amount = this.cleanQuantity(this.fixedExtinguisherConsumption);
    const totalCO2e = amount * parseFloat(this.selectedFixedExtinguisher.factor_total_co2e);

    this.scope1Data.push({
      type: 'extinguisher',
      subtype: this.selectedFixedExtinguisher.name,
      quantity: amount,
      unit: this.selectedFixedExtinguisher.unit,
      source: 'fixed_extinguisher',
      emissionFactorId: this.selectedFixedExtinguisher.id,
      totalCO2e: totalCO2e
    });

    this.selectedFixedExtinguisher = null;
    this.fixedExtinguisherConsumption = '';
  }

  // Fixed Lubricants
  addFixedLubricant() {
    if (!this.selectedFixedLubricant || !this.fixedLubricantConsumption) return;
    const amount = this.cleanQuantity(this.fixedLubricantConsumption);
    const totalCO2e = amount * parseFloat(this.selectedFixedLubricant.factor_total_co2e);

    this.scope1Data.push({
      type: 'lubricant',
      subtype: this.selectedFixedLubricant.name,
      quantity: amount,
      unit: this.selectedFixedLubricant.unit,
      source: 'fixed_lubricant',
      emissionFactorId: this.selectedFixedLubricant.id,
      totalCO2e: totalCO2e
    });

    this.selectedFixedLubricant = null;
    this.fixedLubricantConsumption = '';
  }

  // --- Scope 2: Electricity ---
  electricityConsumption = '';

  addElectricity() {
    if (this.selectedElectricityFactor && this.electricityConsumption) {
      const amount = this.cleanQuantity(this.electricityConsumption);
      const totalCO2e = amount * parseFloat(this.selectedElectricityFactor.factor_total_co2e);

      this.scope2Data.push({
        type: 'electricity',
        subtype: this.selectedElectricityFactor.name,
        quantity: amount,
        unit: this.selectedElectricityFactor.unit,
        emissionFactorId: this.selectedElectricityFactor.id,
        totalCO2e: totalCO2e
      });
      this.electricityConsumption = '';
    }
  }

  // --- Scope 3 ---
  flightKmTraveled = '';
  remoteEmployees = '';
  remoteDaysPerWeek = '';
  wasteAmount = '';
  materialConsumption = '';

  addScope3() {
    // Logic to bundle Scope 3 data
    this.scope3Data = [
      { type: "air_travel", quantity: this.cleanQuantity(this.flightKmTraveled) },
      { type: "remote_work", quantity: this.cleanQuantity(this.remoteEmployees) * this.cleanQuantity(this.remoteDaysPerWeek) * 52 },
      { type: "waste", quantity: this.cleanQuantity(this.wasteAmount) },
      { type: "materials", quantity: this.cleanQuantity(this.materialConsumption) }
    ].filter(item => item.quantity > 0);
  }

  // Submit Handler
  onSubmit() {
    const apiData = {
      uid: 'CURRENT_USER_ID', // Replace with actual user ID
      data: {
        scope1: this.scope1Data,
        scope2: this.scope2Data,
        scope3: this.scope3Data
      }
    };
    console.log('Submitting Data:', apiData);
    // this.http.post('API_URL', apiData).subscribe(...)
  }
}
