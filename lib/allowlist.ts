export const ALLOWLIST_KEY = 'allowed_identity_keys';

export type AllowListEntry = {
  publicKey: string;
  name: string;
  deviceId: string;
  addedAt: string;
};

export const DEFAULT_ALLOWLIST: AllowListEntry[] = [
  {
    publicKey: '',
    name: 'Partner',
    deviceId: '',
    addedAt: new Date().toISOString(),
  },
];

export function isAllowed(publicKey: string, allowlist: AllowListEntry[]): boolean {
  return allowlist.some((entry) => entry.publicKey === publicKey);
}

export function validateAllowlist(allowlist: unknown): allowlist is AllowListEntry[] {
  if (!Array.isArray(allowlist)) return false;
  return allowlist.every(
    (entry) =>
      typeof entry === 'object' &&
      entry !== null &&
      'publicKey' in entry &&
      typeof (entry as Record<string, unknown>).publicKey === 'string' &&
      'name' in entry &&
      typeof (entry as Record<string, unknown>).name === 'string'
  );
}

export const ALLOWLIST_MAX_ENTRIES = 2;
