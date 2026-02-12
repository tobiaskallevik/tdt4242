// Minimal JWT decode (no verification – server handles that)
export function jwtDecode(token) {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
}
