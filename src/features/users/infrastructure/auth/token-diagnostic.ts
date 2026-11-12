interface ExpectedToken {
  issuer?: string;
  clientId?: string;
  audience?: string;
}

// Unverified claims are used only to explain a rejection, never to grant access.
export function describeTokenRejection(
  token: string | undefined,
  expected: ExpectedToken,
): string | undefined {
  if (!token)
    return 'Keycloak no entregó un token de acceso para conectar con el backend. Cierra sesión y vuelve a entrar. [KC_NO_ACCESS_TOKEN]';
  try {
    const payload = token.split('.')[1];
    if (!payload) return undefined;
    const claims: Record<string, unknown> = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    );
    if (
      typeof claims.sub !== 'string' ||
      !claims.sub.trim() ||
      claims.sub.length > 255
    )
      return 'El access token de Keycloak no incluye un identificador de usuario válido. Configura el mapper Subject (sub) del scope prgate-api y vuelve a iniciar sesión. [KC_SUB]';
    if (expected.issuer && claims.iss !== expected.issuer)
      return 'El emisor de la sesión no coincide con el configurado en el backend. Revisa el realm de Keycloak. [KC_ISSUER]';
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!audiences.includes(expected.audience ?? 'prgate-api'))
      return 'La sesión de Keycloak no incluye la audiencia prgate-api. Debe configurarse el alcance de la API en el cliente de Keycloak. [KC_AUDIENCE]';
    if (expected.clientId && claims.azp !== expected.clientId)
      return 'La sesión pertenece a otro cliente de Keycloak. [KC_CLIENT]';
    if (claims.typ !== 'Bearer')
      return 'Keycloak emitió un tipo de token distinto al esperado por el backend. [KC_TOKEN_TYPE]';
    if (typeof claims.exp !== 'number' || claims.exp * 1000 <= Date.now())
      return 'El token de acceso ha vencido o no incluye vencimiento. Cierra sesión y vuelve a entrar. [KC_EXPIRATION]';
  } catch {
    // A malformed token remains a generic rejection; do not expose its contents.
  }
  return undefined;
}
