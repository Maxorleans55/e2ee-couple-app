# UsTwo — Adversarial Security Audit

**Scope:** Authentication, 2-user allowlist, E2EE key storage, transport.
**Threat model:** Two-person intimate messaging app. Adversary = network attacker, relay operator, device compromise, physical access.
**Status:** Pre-code design review. No independent cryptographic audit performed.

---

## 1. Authentication — "Who are you, really?"

### Design
- No passwords, phone numbers, email, or OAuth.
- Identity = Ed25519 keypair generated on first launch via Signal Protocol SDK.
- Private key stored in `expo-secure-store` (iOS Keychain / Android Keystore).
- Identity assertion signed and sent to relay at connection time.

### Findings

| # | Finding | Severity | Mitigation |
|---|---------|----------|------------|
| A1 | No account recovery if private key is lost | High | BIP39 12-word recovery phrase shown once at setup; user writes it down offline. |
| A2 | Device compromise = permanent impersonation | Critical | Keys in hardware-backed secure storage; optional Face ID / biometric gate before key use. |
| A3 | No multi-factor or re-authentication | Medium | Acceptable for 2-person threat model; add PIN lock as optional defense-in-depth. |
| A4 | Identity assertion not bound to device fingerprint | Low | Relay verifies Ed25519 signature; replay possible but key is hardware-bound. |

**Verdict:** Authentication is cryptographically sound but offers no recovery path. Users must safeguard the recovery phrase.

---

## 2. 2-User Allowlist — "Can a third party sneak in?"

### Design
- Relay maintains a hardcoded allowlist of exactly two public identity keys.
- Connections from unknown public keys are rejected at the transport layer before message processing.
- Allowlist is baked into `allowlist.json` at build time or configured once via shared setup.

### Findings

| # | Finding | Severity | Mitigation |
|---|---------|----------|------------|
| L1 | Relay compromise allows adding a third key | Critical | Allowlist signed by app developer; relay verifies signature. Client verifies partner safety number out-of-band (QR or spoken). |
| L2 | Insider at relay operator can modify allowlist | High | Relay is minimal, open-source, self-hostable. You control the infrastructure. |
| L3 | No key rotation mechanism for the allowlist | Medium | Acceptable for static 2-person use; re-key requires app update or config change. |
| L4 | Allowlist entries not cryptographically linked to device | Low | Device ID is informational only; public key is the authoritative identity. |

**Verdict:** Strong for a 2-person model. The weakest link is relay integrity — self-host or audit the relay code.

---

## 3. E2EE Key Storage — "Where do the secrets sleep?"

### Design
- `expo-secure-store` → iOS Keychain (`kSecAttrAccessibleWhenUnlockedThisDeviceOnly`) / Android Keystore (`setUserAuthenticationRequired(true)`).
- Local message history in `expo-sqlite` + SQLCipher, key derived from random 32 bytes in Secure Store.
- No plaintext ever written to disk or network.

### Findings

| # | Finding | Severity | Mitigation |
|---|---------|----------|------------|
| K1 | Android Keystore may fall back to software on cheap devices | Medium | Document device requirements; check `isHardwareBacked` at runtime; warn user if software-only. |
| K2 | SQLCipher key derivation not user-bound | Low | Key is random, stored in Secure Store — not derivable from user password. |
| K3 | Local backups (iCloud/Google Drive) may include ciphertext DB | Medium | Exclude Secure Store from OS backups; encrypt DB backups separately or disable cloud backup for app data. |
| K4 | App process memory contains decrypted plaintext transiently | Inherent | Cannot mitigate at app layer; OS-level protection only. |
| K5 | Screenshot/screen recording captures plaintext | Inherent | Add disappearing-messages timer as defense-in-depth; OS screenshot detection where available. |

**Verdict:** Key storage is strong on modern hardware. Device compromise remains the top residual risk.

---

## 4. Transport Leaks — "What does the relay see?"

### Design
- Relay sees ciphertext envelopes, timestamps, message sizes, connection metadata.
- Server never sees plaintext, private keys, or sender identity (sealed sender).
- WebSocket over TLS (WSS) in production.

### Findings

| # | Finding | Severity | Mitigation |
|---|---------|----------|------------|
| T1 | Metadata analysis (who talks when, message frequency) | High | Fixed-size message padding; cover traffic option; acknowledge limitation. |
| T2 | Timing correlation attacks | Medium | Acceptable for 2-person app; full mixnet out of scope. |
| T3 | Denial of service on relay | Low | Rate limiting per connection; minimal attack surface. |
| T4 | Transport downgrade (plaintext WS) | Critical | Enforce WSS/TLS in production; certificate pinning optional. |

**Verdict:** Metadata leakage is inherent to any non-mixnet design. Acceptable for this threat model with clear user disclosure.

---

## 5. Edge Cases — "What breaks?"

| Scenario | Risk | Mitigation |
|----------|------|------------|
| Reinstall / key loss | Messages undecryptable | BIP39 recovery phrase; session reset + re-key ceremony |
| Partner identity key changes unexpectedly | MITM | Safety number verification required before resuming chat |
| Offline for days | Messages queued | Local queue on sender; replay on reconnect with monotonic counters |
| App backgrounded | Keys in memory | OS secure storage; keys not held in plaintext longer than needed |
| Relay restart | Queued messages lost | Client-side retry with exponential backoff; message IDs for dedup |

---

## 6. Overall Verdict

**Architecture is sound for a strict 2-person E2EE app.**

Residual risks (ranked):
1. **Device compromise** — keys exfiltrated from hardware storage (mitigated by hardware binding, biometric gate).
2. **Key loss** — no recovery without BIP39 phrase (mitigated by offline recovery phrase).
3. **Relay compromise** — third key added to allowlist (mitigated by out-of-band safety number verification).
4. **Metadata leakage** — timing/size analysis (accepted limitation; no mixnet).

**Not covered:** Independent cryptographic audit, penetration testing, formal protocol verification. Do not use for high-risk threat models without professional audit.
