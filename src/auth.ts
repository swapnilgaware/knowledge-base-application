export type UserProfile = { id: string; email: string; displayName: string; role: string };

export async function currentUser(): Promise<UserProfile | null> {
  const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Unable to reach the account service. Please try again.');
  return response.json();
}

export function signIn(): void {
  window.location.replace('/oauth2/authorization/keycloak');
}

export async function signOut(): Promise<void> {
  const response = await fetch('/api/auth/csrf', { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Unable to sign out. Please try again.');
  const token: { parameterName: string; token: string } = await response.json();
  // A browser navigation lets Keycloak end its session and redirect home.
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/api/auth/logout';
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = token.parameterName;
  input.value = token.token;
  form.append(input);
  document.body.append(form);
  form.submit();
}
