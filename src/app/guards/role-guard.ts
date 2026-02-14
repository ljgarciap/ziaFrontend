import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const expectedRoles = route.data['roles'] as Array<string>;
    const user = authService.currentUser();

    if (user && expectedRoles.includes(user.role)) {
        return true;
    }

    // Redirect to dashboard if not authorized
    router.navigate(['/dashboard']);
    return false;
};
