import {
  createPublicKey,
  randomUUID,
  verify,
  type webcrypto,
} from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import type { Plugin, ProxyOptions } from 'vite';
type JsonWebKey = webcrypto.JsonWebKey;

const expected = {
  issuer: 'http://localhost:8090/realms/prgate',
  audience: 'prgate-api',
  clientId: 'prgate-frontend',
};
const observedPaths = new Set([
  '/api/me/session',
  '/api/me',
  '/api/me/registration',
  '/api/me/integrations/github',
  '/api/me/integrations/github/authorization',
]);

export function summarizeBearer(authorization?: string) {
  const hasBearer = Boolean(authorization?.startsWith('Bearer '));
  const empty = {
    hasBearer,
    tokenReadable: false,
    issuerMatches: false,
    audienceMatches: false,
    clientMatches: false,
    subjectValid: false,
    typeMatches: false,
    expirationValid: false,
    algorithmMatches: false,
    headerType: 'unknown',
  };
  if (!hasBearer) return empty;
  try {
    const parts = authorization!.slice(7).split('.');
    const header = JSON.parse(
      Buffer.from(parts[0], 'base64url').toString('utf8'),
    );
    const claims = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8'),
    );
    return {
      hasBearer,
      tokenReadable: true,
      issuerMatches: claims.iss === expected.issuer,
      audienceMatches: (Array.isArray(claims.aud)
        ? claims.aud
        : [claims.aud]
      ).includes(expected.audience),
      clientMatches: claims.azp === expected.clientId,
      subjectValid:
        typeof claims.sub === 'string' &&
        claims.sub.trim().length > 0 &&
        claims.sub.length <= 255,
      typeMatches: claims.typ === 'Bearer',
      expirationValid:
        typeof claims.exp === 'number' && claims.exp * 1000 > Date.now(),
      algorithmMatches: header.alg === 'RS256',
      headerType:
        header.typ === 'JWT'
          ? 'JWT'
          : header.typ === 'at+jwt'
            ? 'at+jwt'
            : header.typ == null
              ? 'absent'
              : 'other',
    };
  } catch {
    return empty;
  }
}

export function createLocalSessionAudit() {
  type Audit = {
    id: string;
    time: string;
    source: 'account' | 'other';
    method: string;
    frontendUrl: string;
    backendUrl: string;
    status?: number;
    errorCode?: string;
    role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
    accountStatus?: 'ACTIVE' | 'INACTIVE';
    signatureValid: boolean | null;
    token: ReturnType<typeof summarizeBearer>;
  };
  const records: Audit[] = [];
  const pending = new WeakMap<IncomingMessage, Audit>();
  let keys:
    | { fetchedAt: number; values: (JsonWebKey & { kid?: string })[] }
    | undefined;

  async function checkSignature(
    authorization: string | undefined,
  ): Promise<boolean | null> {
    if (!authorization?.startsWith('Bearer ')) return null;
    try {
      const parts = authorization.slice(7).split('.');
      if (parts.length !== 3) return false;
      const header = JSON.parse(
        Buffer.from(parts[0], 'base64url').toString('utf8'),
      );
      if (header.alg !== 'RS256') return false;
      if (!keys || Date.now() - keys.fetchedAt > 60_000) {
        const response = await fetch(
          'http://127.0.0.1:8090/realms/prgate/protocol/openid-connect/certs',
          { signal: AbortSignal.timeout(5000) },
        );
        if (!response.ok) return null;
        const body = (await response.json()) as {
          keys: (JsonWebKey & { kid?: string })[];
        };
        keys = { fetchedAt: Date.now(), values: body.keys };
      }
      const key = keys.values.find(
        (value) => value.kid === header.kid && value.kty === 'RSA',
      );
      if (!key) return false;
      return verify(
        'RSA-SHA256',
        Buffer.from(`${parts[0]}.${parts[1]}`),
        createPublicKey({ key, format: 'jwk' }),
        Buffer.from(parts[2], 'base64url'),
      );
    } catch {
      return null;
    }
  }

  const plugin: Plugin = {
    name: 'local-session-audit',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split('?')[0] !== '/__local/session-audit')
          return next();
        const origin = request.headers.origin;
        if (
          request.method !== 'GET' ||
          (origin &&
            !['http://localhost:5173', 'http://127.0.0.1:5173'].includes(
              origin,
            ))
        ) {
          response.statusCode = 403;
          response.end();
          return;
        }
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Cache-Control', 'no-store');
        response.end(JSON.stringify({ expected, records }));
      });
    },
  };
  const proxy: ProxyOptions = {
    target: 'http://localhost:8080',
    changeOrigin: true,
    configure(instance) {
      instance.on('proxyReq', (_outgoing, request) => {
        const path = request.url?.split('?')[0] ?? '';
        if (!observedPaths.has(path)) return;
        const authorization = request.headers.authorization;
        const record: Audit = {
          id: randomUUID(),
          time: new Date().toISOString(),
          source:
            request.headers.referer?.split('?')[0] ===
            'http://localhost:5173/account'
              ? 'account'
              : 'other',
          method: request.method ?? 'unknown',
          frontendUrl: `http://localhost:5173${path}`,
          backendUrl: `http://localhost:8080${path}`,
          signatureValid: null,
          token: summarizeBearer(authorization),
        };
        pending.set(request, record);
        records.push(record);
        if (records.length > 20) records.shift();
        void checkSignature(authorization).then((valid) => {
          record.signatureValid = valid;
        });
      });
      instance.on('proxyRes', (upstream, request) => {
        const record = pending.get(request);
        if (!record) return;
        record.status = upstream.statusCode;
        let body = '';
        upstream.on('data', (chunk: Buffer) => {
          if (body.length < 8192) body += chunk.toString('utf8');
        });
        upstream.on('end', () => {
          try {
            const result = JSON.parse(body);
            if (
              typeof result.code === 'string' &&
              /^[A-Z_]{1,80}$/.test(result.code)
            )
              record.errorCode = result.code;
            if (['STUDENT', 'TEACHER', 'ADMIN'].includes(result.role))
              record.role = result.role;
            if (['ACTIVE', 'INACTIVE'].includes(result.status))
              record.accountStatus = result.status;
          } catch {
            /* Non-JSON responses carry only the HTTP status. */
          }
          serverLog(record);
        });
      });
    },
  };
  function serverLog(record: Audit) {
    // Only the allowlisted report is emitted, never request headers or response bodies.
    globalThis.console.info('[local-session-audit]', JSON.stringify(record));
  }
  return { plugin, proxy };
}
