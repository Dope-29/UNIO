export function passwordChecks(password: string) {
  return [
    { label: 'At least 9 characters', valid: password.length >= 9 },
    { label: 'At most 72 characters and 72 UTF-8 bytes', valid: password.length <= 72 && new TextEncoder().encode(password).length <= 72 },
    { label: 'An uppercase letter (A–Z)', valid: /[A-Z]/.test(password) },
    { label: 'A lowercase letter (a–z)', valid: /[a-z]/.test(password) },
    { label: 'A special character', valid: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function validPassword(password: string) {
  return passwordChecks(password).every((rule) => rule.valid);
}

export default function PasswordRules({ password }: { password: string }) {
  return <div aria-live="polite" style={{ fontSize: 12, marginTop: 6 }}>
    <div>Password requirements{password && !validPassword(password) ? ': constraints not matching' : ''}</div>
    <ul style={{ paddingLeft: 20, margin: '4px 0' }}>
      {passwordChecks(password).map((rule) => <li key={rule.label} style={{ color: password ? (rule.valid ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)' }}>{rule.label}</li>)}
    </ul>
  </div>;
}
