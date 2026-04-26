import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, Session, Subscription, SubscriptionDraft } from '../../shared/models/subscription.models';

@Injectable({ providedIn: 'root' })
export class SubscriptionApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';

  login(email: string, password: string): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/auth/login`, { email, password });
  }

  getSubscriptions(userId: string): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/subscriptions?userId=${userId}`);
  }

  createSubscription(userId: string, draft: SubscriptionDraft): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/subscriptions`, {
      ...draft,
      userId,
      currency: 'RUB',
    });
  }

  updateSubscription(subscription: Subscription): Observable<Subscription> {
    return this.http.put<Subscription>(`${this.apiUrl}/subscriptions/${subscription.id}`, subscription);
  }

  deleteSubscription(id: string): Observable<{ id: string }> {
    return this.http.delete<{ id: string }>(`${this.apiUrl}/subscriptions/${id}`);
  }

  getCategories(userId: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories?userId=${userId}`);
  }

  updateCategoryLimit(categoryId: string, monthlyLimit: number): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${categoryId}`, { monthlyLimit });
  }
}
