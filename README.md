# UsTwo — End-to-End Encrypted Couple App

A private, end-to-end encrypted React Native (Expo + TypeScript) mobile app designed strictly for two people.

## Architecture

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 52, React Native 0.79, TypeScript strict |
| Navigation | Expo Router |
| State | Zustand |
| Crypto | Signal Protocol (X3DH + Double Ratchet) via `@open-e2ee/signal-protocol-sdk` |
| Key storage | `expo-secure-store` (iOS Keychain / Android Keystore) |
| Local DB | `expo-sqlite` + SQLCipher |
| Transport | Minimal WebSocket relay with 2-user allowlist |
| UI | Custom warm theme, motion-design micro-interactions |

## Project Structure

```
app/               # Expo Router screens
  _layout.tsx      # Root stack
  (setup)/         # Identity setup & pairing
  (chat)/          # Conversation + memories
components/        # Reusable UI components
lib/               # Crypto, relay, secure-store, allowlist
relay-server/      # Node WebSocket relay (2-user allowlist)
assets/            # Images, icons
SECURITY_AUDIT.md  # Adversarial audit findings
```

## Getting Started

### Prerequisites
- Node.js 20+
- npx / npm
- Expo Go (iOS/Android) or Xcode / Android Studio

### Install

```bash
cd C:\e2ee-couple-app
npm install
```

### Configure the allowlist

Edit `relay-server/allowlist.json` and replace the placeholder public keys with Alice's and Bob's Ed25519 public keys (base64). The relay will reject any connection not in this list.

### Start the relay

```bash
cd relay-server
npm install
npm start
# listens on ws://0.0.0.0:8787
```

### Start the app

```bash
cd C:\e2ee-couple-app
npx expo start
```

Scan the QR code with Expo Go on your phone.

## Security

Read `SECURITY_AUDIT.md` for the full adversarial audit of authentication, allowlist, key storage, and transport.

**Not audited by an independent security firm.** Use for personal, low-risk messaging only.
