const encoder = new TextEncoder();

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return btoa(String.fromCharCode(...data)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return base64url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

export async function createSessionCookie(options: { secret: string; ttlSeconds: number; now?: number }) {
  const now = options.now ?? Date.now();
  const expiresAt = now + options.ttlSeconds * 1000;
  const nonce = crypto.randomUUID();
  const payload = `${expiresAt}.${nonce}`;
  const signature = await sign(payload, options.secret);
  return { value: `${payload}.${signature}`, expiresAt };
}

export async function verifySessionCookie(
  value: string | undefined | null,
  options: { secret: string; now?: number },
): Promise<boolean> {
  if (!value) return false;
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  const [expiresAtText, nonce, signature] = parts;
  const expiresAt = Number.parseInt(expiresAtText ?? '', 10);
  if (!Number.isFinite(expiresAt) || expiresAt <= (options.now ?? Date.now())) return false;
  const expected = await sign(`${expiresAt}.${nonce}`, options.secret);
  return expected === signature;
}
