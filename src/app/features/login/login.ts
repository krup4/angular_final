import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TuiButton, TuiLoader, TuiNotification } from '@taiga-ui/core';
import { SubscriptionApiService } from '../../core/api/subscription-api.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, TuiButton, TuiLoader, TuiNotification],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(SubscriptionApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['student@example.com', [Validators.required, Validators.email]],
    password: ['password123', [Validators.required, Validators.minLength(6)]],
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.api.login(this.form.controls.email.value, this.form.controls.password.value).subscribe({
      next: async (session) => {
        this.auth.setSession(session);
        this.loading.set(false);
        await this.router.navigateByUrl('/dashboard');
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.loading.set(false);
      },
    });
  }
}
