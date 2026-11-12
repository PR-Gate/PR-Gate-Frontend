import { expect, it } from 'vitest';
import { describeTokenRejection } from './token-diagnostic';

const expected = {
  issuer: 'http://localhost:8090/realms/prgate',
  clientId: 'prgate-frontend',
  audience: 'prgate-api',
};
const valid = {
  sub: 'fixture-subject',
  iss: expected.issuer,
  azp: expected.clientId,
  aud: ['prgate-api'],
  typ: 'Bearer',
  exp: Math.floor(Date.now() / 1000) + 300,
};
const token = (claims: object) =>
  `header.${btoa(JSON.stringify(claims))}.unverified-fixture`;

it('reports only a safe diagnosis when the required audience is absent', () => {
  const result = describeTokenRejection(
    token({ ...valid, aud: ['account'] }),
    expected,
  );
  expect(result).toContain('[KC_AUDIENCE]');
  expect(result).not.toContain('unverified-fixture');
});

it('identifies the missing subject that the backend requires even when other claims match', () => {
  const claims: Record<string, unknown> = { ...valid };
  delete claims.sub;
  expect(describeTokenRejection(token(claims), expected)).toContain('[KC_SUB]');
});
it('does not treat a matching unverified payload as proof of authentication', () => {
  expect(describeTokenRejection(token(valid), expected)).toBeUndefined();
});
it('handles missing credentials and malformed tokens without exposing their contents', () => {
  expect(describeTokenRejection(undefined, expected)).toContain(
    '[KC_NO_ACCESS_TOKEN]',
  );
  expect(
    describeTokenRejection('malformed-private-value', expected),
  ).toBeUndefined();
});
