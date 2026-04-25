import { Injectable, computed, signal } from '@angular/core';
import { Session } from '../../shared/models/subscription.models';

const SESSION_KEY = 'subscription-manager-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionSignal = signal<Session | null>(readStoredSession());

  readonly session = this.sessionSignal.asReadonly();
  readonly user = computed(() => this.sessionSignal()?.user ?? null);
  readonly token = computed(() => this.sessionSignal()?.token ?? null);
  readonly isAuthenticated = computed(() => Boolean(this.sessionSignal()?.token));

  setSession(session: Session): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.sessionSignal.set(null);
  }
}

function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);

    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);

    return null;
  }
}
