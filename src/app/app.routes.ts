import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { DashboardContentComponent } from './components/dashboard/dashboard-content';
import { FormComponent } from './components/form/form';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { CompanyManagementComponent } from './components/admin/company-management/company-management';
import { UserManagementComponent } from './components/admin/user-management/user-management';
import { SectorManagementComponent } from './components/admin/sector-management/sector-management';
import { MetadataManagementComponent } from './components/admin/metadata-management/metadata-management';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: '',
        component: DashboardComponent, // Dashboard is the layout
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardContentComponent }, // Default view
            { path: 'form', component: FormComponent },


            // Admin Routes
            {
                path: 'admin/companies',
                component: CompanyManagementComponent,
                canActivate: [roleGuard],
                data: { roles: ['superadmin', 'admin'] }
            },
            {
                path: 'admin/sectors',
                component: SectorManagementComponent,
                canActivate: [roleGuard],
                data: { roles: ['superadmin', 'admin'] }
            },
            {
                path: 'admin/users',
                component: UserManagementComponent,
                canActivate: [roleGuard],
                data: { roles: ['superadmin', 'admin'] }
            },
            {
                path: 'admin/metadata',
                component: MetadataManagementComponent,
                canActivate: [roleGuard],
                data: { roles: ['superadmin'] }
            },

            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ]
    },
    // Fallback
    { path: '**', redirectTo: '/dashboard' }
];
