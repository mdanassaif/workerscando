# 🔐 Dead Man's Switch

A secure, serverless dead man's switch built with Cloudflare Workers. Automatically delivers encrypted secrets to designated recipients if you fail to respond to regular check-ins.

## 💰 100% FREE Version!

Uses Cloudflare Workers FREE tier + external cron (cron-job.org) - no paid plans needed!

## 🎯 Features

- **End-to-End Encryption**: Secrets encrypted client-side using AES-256-GCM
- **Cloudflare Edge**: Runs on Cloudflare's global network
- **Email Notifications**: Regular "proof of life" check-ins via email
- **Auto-Trigger**: After 2 missed checks, secret is sent to recipient
- **Zero Knowledge**: Server never sees unencrypted secrets

## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │ ──── Client-side AES-256-GCM Encryption
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Cloudflare      │
│ Workers         │ ──── API Endpoints & Email Logic
└────────┬────────┘
         │
    ┌────┴─────┬──────────────┐
    ▼          ▼              ▼
┌────────┐ ┌─────────────┐ ┌──────────┐
│Workers │ │ Resend API  │ │ External │
│   KV   │ │  (Email)    │ │   Cron   │
└────────┘ └─────────────┘ └──────────┘
```

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/create` | Create a new dead man's switch |
| `POST` | `/api/verify/:token` | Verify check-in (proof of life) |
| `GET` | `/api/check/:id` | Get switch status |
| `GET` | `/api/decrypt/:id` | Get encrypted data for decryption |
| `POST` | `/api/cron-check-all` | External cron trigger (requires auth) |

## 🚀 Deployment

### 1. Deploy the Worker

```bash
cd workers/dead-man-switch
npm install
wrangler deploy
```

### 2. Set Secrets

```bash
# Resend API key for sending emails
wrangler secret put RESEND_API_KEY

# Secret for external cron authentication
wrangler secret put CRON_SECRET
```

Generate a secure CRON_SECRET:
```bash
openssl rand -base64 32
```

### 3. Set Up External Cron (cron-job.org)

Since Cloudflare Workers free tier doesn't include scheduled triggers, use cron-job.org:

1. Sign up at [cron-job.org](https://cron-job.org) (free)
2. Create a new cron job:
   - **URL**: `https://dead-man-switch.brogee9o9.workers.dev/api/cron-check-all`
   - **Method**: POST
   - **Headers**: `Authorization: Bearer YOUR_CRON_SECRET`
   - **Schedule**: Every hour (or as needed)

## 🔒 Security

- Client-side AES-256-GCM encryption
- PBKDF2 key derivation (100,000 iterations)
- Server stores only encrypted blobs
- Unique verification tokens per check-in

## 📄 License

MIT
