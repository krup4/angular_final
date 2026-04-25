import { AuthService } from './auth.service';
import { Session } from '../../shared/models/subscription.models';

const session: Session = {
  token: 'token',
  user: {
    id: 'user-1',
    email: 'student@example.com',
    name: 'Павел',
  },
};

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts without authenticated user', () => {
    const service = new AuthService();

    expect(service.isAuthenticated()).toBe(false);
  });

  it('stores session in localStorage', () => {
    const service = new AuthService();

    service.setSession(session);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()?.email).toBe('student@example.com');
    expect(localStorage.getItem('subscription-manager-session')).toContain('token');
  });

  it('clears session on logout', () => {
    const service = new AuthService();

    service.setSession(session);
    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('subscription-manager-session')).toBeNull();
  });
});
