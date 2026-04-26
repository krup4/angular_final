import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Session } from '../../shared/models/subscription.models';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

const session: Session = {
  token: 'token',
  user: {
    id: 'user-1',
    email: 'student@example.com',
    name: 'Павел',
  },
};

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, provideRouter([])],
    });
  });

  it('allows authenticated users to activate protected routes', () => {
    TestBed.inject(AuthService).setSession(session);

    const result = runGuard();

    expect(result).toBe(true);
  });

  it('redirects anonymous users to login', () => {
    const result = runGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });
});

function runGuard(): boolean | UrlTree {
  return TestBed.runInInjectionContext(
    () => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as boolean | UrlTree,
  );
}
