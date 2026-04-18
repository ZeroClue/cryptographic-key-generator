# Cryptographic Key Generator - Discoverability & Growth Roadmap

**Date:** 2025-01-17
**Author:** Claude Code
**Status:** Approved

## Overview

Strategic roadmap to transform the cryptographic key generator from a developer tool into a discoverable, user-friendly product. Focus on user growth through SEO and discoverability (Priority A), quick wins to delight users (Priority D), developer experience improvements (Priority C), and enterprise features (Priority B).

**Architecture:** Hybrid approach — Vercel for frontend hosting, Supabase for managed backend services (auth, database, rate limiting).

**Timeline:** 6 weeks for core features, 4-6 months for full roadmap.

---

## Phase 1: GitHub Repository Optimization (Week 1)

**Goal:** Improve GitHub search visibility and repository appeal.

### 1.1 Repository Metadata

**File:** `.github/repository.yaml` (create)

```yaml
name: Cryptographic Key Generator
description: Generate cryptographic keys securely in your browser - RSA, ECC, PGP, SSH, and more. Client-side only, zero data transmission.
topics:
  - cryptography
  - security
  - pgp
  - ssh
  - rsa
  - ecdsa
  - ed25519
  - key-generator
  - web-security
  - client-side-crypto
  - web-crypto-api
  - openpgp
  - x509
  - jwt
  - zero-trust
language: TypeScript
license: MIT
```

### 1.2 README SEO Enhancement

**Updates to `README.md`:**

- Add H1/H2 headings for each key type
- Add "What is this?" section with plain English explanations
- Add comparison sections ("RSA vs ECDSA", "SSH vs PGP")
- Add code examples for common use cases
- Add badges: build status, license, security, version
- Add "Quick Start" section with 3-click path to first key

### 1.3 GitHub Repository Structure

**Create `.github/` folder:**
- `ISSUE_TEMPLATE/bug_report.md`
- `ISSUE_TEMPLATE/feature_request.md`
- `PULL_REQUEST_TEMPLATE.md`
- `SECURITY.md` (already exists, verify)
- `CONTRIBUTING.md`
- `workflows/` for CI/CD badges

### 1.4 Social Preview

**Add:** `images/social-preview.png` (1200x630px)
- Shows app UI with key types listed
- Tagline: "Secure, Client-Side Cryptographic Key Generation"
- OpenGraph tags in metadata

---

## Phase 2: App-Integrated SEO Content (Weeks 2-3)

**Goal:** Leverage the Vercel-hosted app for discoverability and education.

### 2.1 New "Why?" Page (`/why` or `/about`)

**Route:** `/src/pages/Why.tsx` or `/src/pages/About.tsx`

**Sections:**

#### "Why Client-Side Crypto?"
- Zero server trust — your keys never leave your browser
- Web Crypto API — military-grade encryption in modern browsers
- Open source transparency — audit the code yourself
- No account required — start generating immediately

#### "How It Works"
```
[Visual Diagram]

Your Browser          This Tool              Internet
    │                      │                     │
    │  Generate Key       │  Web Crypto API     │
    │  ────────────────>   │  ────────────────>  │
    │                      │                     │
    │  Private Key        │  (No data sent!)    │
    │  <────────────────    │                     │
    │                      │                     │
    └──────────────────────┴─────────────────────┘
```

#### "Algorithm Comparison"
| Algorithm | Key Size | Speed | Security | Best For |
|-----------|----------|-------|----------|----------|
| RSA-2048 | 2048-bit | Slow | Proven | General encryption |
| RSA-4096 | 4096-bit | Slower | Future-proof | High-security needs |
| ECDSA P-256 | 256-bit | Fast | Strong | Certificates, signatures |
| Ed25519 | 256-bit | Fastest | Modern | SSH, modern apps |
| X25519 | 256-bit | Fastest | Modern | Key exchange |

#### "Use Cases Guide"
- SSH keys → Server access, GitHub/GitLab authentication
- PGP keys → Email encryption, file signing, identity
- RSA keys → TLS certificates, document signing
- AES keys → File encryption, data at rest
- HMAC keys → API authentication, data integrity

#### "Security Architecture"
- Content Security Policy meta tag
- HTTPS enforcement
- No tracking, no analytics
- OpenPGP.js lazy loading
- Memory leak prevention
- Secure key deletion

### 2.2 Enhanced Homepage SEO

**Add to `/src/pages/index.tsx` (above current generator):**

**Section 1: Hero Enhancement**
```
┌─────────────────────────────────────────────────────────┐
│  Cryptographic Key Generator                            │
│  Secure • Client-Side • No Registration Required        │
│                                                          │
│  [Generate Keys] [Learn Why] [View Documentation]      │
└─────────────────────────────────────────────────────────┘
```

**Section 2: "What keys do you need?"**
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 🖥️ SSH Keys   │  │ 🔐 PGP Keys   │  │ 🔒 TLS/HTTPS  │
│              │  │              │  │              │
│ Server login │  │ Email enc    │  │ Certificates │
│ Git auth     │  │ File signing │  │ Web security │
│ [Generate]   │  │ [Generate]   │  │ [Generate]   │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Section 3: "Educational Resources"** (bottom of homepage)
- Algorithm guides (RSA vs ECDSA, symmetric vs asymmetric)
- Security best practices
- Integration examples
- Link to full documentation

### 2.3 Dynamic Meta Tags

**File:** `/src/hooks/useSeo.ts` (create)

```typescript
interface SeoProps {
  title: string;
  description: string;
  path: string;
}

export function useSeo({ title, description, path }: SeoProps) {
  useEffect(() => {
    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', `https://crypto-gen.kern.web.za${path}`);
    }
  }, [title, description, path]);
}
```

**Usage in components:**
```typescript
// KeyGenerator.tsx
useSeo({
  title: 'RSA Key Generator | Create RSA Keys Securely',
  description: 'Generate 2048-bit and 4096-bit RSA key pairs online. Client-side, secure, no data sent to servers.',
  path: '/rsa'
});
```

---

## Phase 3: Quick Wins - User Delight (Week 4)

**Goal:** Ship small improvements rapidly that make the tool more polished and delightful.

### 3.1 Enhanced Copy-to-Clipboard

**Current:** One copy button per textarea

**Enhancements:**
- Individual copy buttons for each field:
  - Public key
  - Private key
  - SSH public key
  - Fingerprint
  - Command-line equivalent
- Visual feedback: "Copied!" with green checkmark animation
- Keyboard shortcut feedback: Show "Ctrl+C detected!" toast
- Copy history dropdown (last 5 copied items)

### 3.2 Loading State Improvements

**Replace:** Generic spinner

**With:** Skeleton screens matching actual output
```typescript
<KeyOutputSkeleton>
  <HeaderSkeleton />
  <TextareaSkeleton lines={12} />
  <ButtonSkeleton />
</KeyOutputSkeleton>
```

**Progress indication for slow operations:**
```typescript
// PGP Key Generation
Generating PGP RSA-4096 key pair...
[████████████░░░░░] 60% - Generating key pair...
```

**Time estimates:**
- AES keys: < 1 second
- RSA keys: 2-5 seconds
- PGP keys: 5-15 seconds

### 3.3 Tooltips for Complex Terms

**Implementation:** React-tooltip library

**Tooltip content:**
- **RSA-OAEP**: "RSA encryption with Optimal Asymmetric Encryption Padding. Used for encrypting data."
- **Curve25519**: "Modern elliptic curve for key exchange. Faster and more secure than older 2048-bit RSA."
- **4096-bit**: "Key size. Larger = more secure but slower. 4096 bits is future-proof."
- **Sign/Verify**: "Digital signatures prove identity. Encrypt protects data."
- Each tooltip links to relevant section in /why page

### 3.4 Download History (Session-Based)

**File:** `src/hooks/useKeyHistory.ts` (create)

```typescript
interface KeyHistoryItem {
  timestamp: number;
  algorithm: string;
  keyType: 'public' | 'private' | 'symmetric';
  preview: string; // First 50 chars
}

export function useKeyHistory() {
  const [history, setHistory] = useState<KeyHistoryItem[]>([]);
  const maxHistory = 5;

  const addToHistory = (item: KeyHistoryItem) => {
    setHistory(prev => [item, ...prev].slice(0, maxHistory));
  };

  return { history, addToHistory };
}
```

**UI Component:** "Recent Keys" dropdown above generator
```
┌────────────────────────────────────┐
│ 📜 Recent Keys         ▼          │
├────────────────────────────────────┤
│ ▓ RSA-4096 • 2 min ago           │
│ ▓ PGP-ECC • 15 min ago            │
│ ▓ SSH-RSA • 1 hour ago            │
└────────────────────────────────────┘
```

### 3.5 Better Error Messages

**Before:**
```
Error: Key generation failed
```

**After:**
```
Key generation failed: Web Crypto API error

What went wrong: Your browser doesn't support Ed25519 keys.

Try instead:
• ECDSA with P-256 curve (widely supported)
• RSA-4096 (universally supported)

[Copy error to clipboard] [Report bug]
```

**Error categorization:**
- User input errors → Helpful guidance
- Browser compatibility → Alternative suggestions
- Network errors → Retry options
- Bugs → Report bug with auto-filled context

---

## Phase 4: Developer Experience - Supabase Integration (Weeks 5-6)

**Goal:** Add programmatic API access and developer-friendly features while maintaining client-side crypto model.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                        │
│  React SPA (crypto in browser) + API Routes (/api/*)       │
│  • /api/generate  • /api/encrypt  • /api/sign             │
│  • /api/register • /api/login    • /api/usage             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Backend)                       │
│  • Auth (email/password, magic links)                      │
│  • PostgreSQL (users, api_keys, usage_logs)                │
│  • Row Level Security (user isolation)                      │
└─────────────────────────────────────────────────────────────┘
```

**Key principle:** All cryptographic operations still happen client-side. Supabase only manages: auth, API keys, rate limiting, usage analytics.

### 4.1 Supabase Setup

**Project:** Create in Supabase dashboard

**Database tables:**

```sql
-- Users table (handled by Supabase Auth, extended with RLS)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text,
  newsletter_opt_in boolean default false,
  created_at timestamptz default now(),
  api_key_limit integer default 100 -- requests per day
);

-- API Keys table
create table public.api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade,
  key_hash text unique, -- SHA-256 hash of API key
  name text, -- User-defined name
  rate_limit_tier text default 'free', -- free, pro, enterprise
  is_active boolean default true,
  created_at timestamptz default now(),
  last_used_at timestamptz
);

-- Usage Logs table
create table public.usage_logs (
  id uuid default gen_random_uuid() primary key,
  api_key_id uuid references public.api_keys on delete cascade,
  endpoint text, -- /api/generate, /api/encrypt, etc.
  timestamp timestamptz default now(),
  status text -- success, rate_limited, error
);

-- Indexes for performance
create index idx_usage_logs_api_key_timestamp on public.usage_logs(api_key_id, timestamp);
create index idx_api_keys_user_id on public.api_keys(user_id);
```

**Row Level Security:**
```sql
-- Users can only see their own API keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own API keys"
  ON public.api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys"
  ON public.api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 4.2 Authentication Flow

**Registration page:** `/register` (new route)

**Fields:**
- Email (required)
- Password (required, strength indicator with zxcvbn)
- Newsletter opt-in (optional, checked by default)
- "I accept the Terms" checkbox

**Flow:**
1. User submits form
2. Supabase Auth creates user
3. Create entry in `public.users` table
4. Generate first API key automatically
5. Show API key (only time it's displayed!)
6. Send welcome email with API key backup link

**Login page:** `/login` (new route)

**Options:**
- Email + password
- Magic link (passwordless)

**Session management:** Supabase handles JWT tokens, stored in httpOnly cookies

### 4.3 API Routes Design

**All routes require valid API key (except `/api/register`, `/api/login`)**

**Route structure:**
```
POST /api/register          - Create new account
POST /api/login             - Login existing user
POST /api/logout            - Logout
GET  /api/me                - Get current user info
POST /api/keys              - Create new API key
GET  /api/keys              - List user's API keys
DELETE /api/keys/:id        - Delete API key
GET  /api/usage             - Get usage statistics
POST /api/generate          - Generate cryptographic key
POST /api/encrypt           - Encrypt data
POST /api/decrypt           - Decrypt data
POST /api/sign              - Sign data
POST /api/verify            - Verify signature
```

**Example: POST /api/generate**

**Request:**
```json
{
  "algorithm": "RSA-4096",
  "format": "pem"
}
```

**Response:**
```json
{
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...",
  "privateKey": "-----BEGIN PRIVATE KEY-----\n...",
  "keyId": "rsa-4096-abc123",
  "generatedAt": "2025-01-17T10:30:00Z"
}
```

**Rate limiting middleware:**
```typescript
// middleware/rateLimit.ts
export async function rateLimit(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const hash = sha256(apiKey);
  
  // Get API key from database
  const { data: keyData } = await supabase
    .from('api_keys')
    .select('rate_limit_tier, user_id')
    .eq('key_hash', hash)
    .single();
  
  if (!keyData) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // Check today's usage
  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', keyData.id)
    .gte('timestamp', today);
  
  const limits = { free: 100, pro: 10000 };
  const limit = limits[keyData.rate_limit_tier] || limits.free;
  
  if (count >= limit) {
    await supabase.from('usage_logs').insert({
      api_key_id: keyData.id,
      endpoint: req.path,
      status: 'rate_limited'
    });
    
    return res.status(429).json({
      error: 'Rate limit exceeded',
      limit: limit,
      resetAt: endOfToday()
    });
  }
  
  // Log usage and continue
  req.apiKeyId = keyData.id;
  req.userId = keyData.user_id;
  next();
}
```

### 4.4 Developer Portal Page

**Route:** `/developers`

**Sections:**

#### API Keys Management
```
┌─────────────────────────────────────────────────────────┐
│ Your API Keys                                          │
│                                                          │
│ + Create New API Key                                    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Production Key • Created Jan 10, 2025               │ │
│ │ sk_live_abc123...xyz789    [Copy] [Revoke]          │ │
│ │ Usage today: 45/100                                 │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Testing Key • Created Jan 15, 2025                   │ │
│ │ sk_test_def456...uvw012    [Copy] [Revoke]          │ │
│ │ Usage today: 12/100                                 │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Usage Analytics
```
┌─────────────────────────────────────────────────────────┐
│ Usage Analytics (Last 30 Days)                         │
│                                                          │
│ Total Requests: 1,234                                   │
│ Rate Limit: 100/day                                     │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Requests by Endpoint:                                │ │
│ │ /api/generate    ████████████░░ 800                 │ │
│ │ /api/encrypt     ████░░░░░░░░░░ 250                 │ │
│ │ /api/sign       █████░░░░░░░░░ 180                  │ │
│ │ /api/verify     ██░░░░░░░░░░░░░ 4                    │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Code Examples

**Tabs:** JavaScript • Python • curl • Go

**JavaScript Example:**
```javascript
const apiKey = 'sk_live_abc123...xyz789'; // Your API key

const response = await fetch('https://crypto-gen.kern.web.za/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey
  },
  body: JSON.stringify({
    algorithm: 'RSA-4096',
    format: 'pem'
  })
});

const { publicKey, privateKey } = await response.json();
console.log('Public key:', publicKey);
```

**Python Example:**
```python
import requests

api_key = 'sk_live_abc123...xyz789'
url = 'https://crypto-gen.kern.web.za/api/generate'

payload = {
    'algorithm': 'RSA-4096',
    'format': 'pem'
}

headers = {
    'Content-Type': 'application/json',
    'X-API-Key': api_key
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

print(f"Public key: {data['publicKey']}")
print(f"Private key: {data['privateKey']}")
```

### 4.5 Newsletter Integration

**Simple approach:** Use Supabase built-in emails

**Setup:**
1. Create email template in Supabase Dashboard
2. Add "SendGrid" or "Mailgun" SMTP config to Supabase
3. Trigger emails on:

**Triggers:**
- Welcome email (on registration)
- API key created (with backup link)
- Weekly usage summary (optional, opt-in)
- Rate limit warning (at 80% of daily limit)

**Alternative:** Export email list to Mailchimp/ConvertKit for better newsletter features

---

## Phase 5: Enterprise Features (Future - Months 4-6)

**These features come after achieving product-market fit and having paying customers.**

### 5.1 Advanced Security & Compliance

**Security Audit Reports:**
- Automated security scanning with npm audit
- Dependency vulnerability reports
- Open source vulnerability database (OSV) integration
- Export security reports for compliance

**Compliance Presets:**
- **NIST SP 800-57**: Key management recommendations
- **FIPS 140-2**: Federal Information Processing Standards
- **CNSA Suite**: Commercial National Security Algorithm
- **GDPR**: Data Protection and Privacy compliance

**Compliance Mode UI:**
```typescript
// Add to settings
const [complianceMode, setComplianceMode] = useState('none');

<select value={complianceMode} onChange={setComplianceMode}>
  <option value="none">Standard Mode</option>
  <option value="nist">NIST SP 800-57</option>
  <option value="fips">FIPS 140-2 Compliant</option>
  <option value="cnsa">CNSA Suite</option>
</select>

// Filter algorithms based on compliance mode
const compliantAlgorithms = algorithms.filter(alg => {
  if (complianceMode === 'fips') return alg.fipsApproved;
  if (complianceMode === 'cnsa') return alg.cnsaApproved;
  return true;
});
```

### 5.2 Key Management & Storage

**Persistent Key Vault:**
- Encrypted key storage using master password
- PBKDF2 or Argon2 for master key derivation
- AES-256-GCM for vault encryption
- Zero-knowledge architecture

**Key Rotation Automation:**
- Schedule key rotation reminders
- One-click key rotation with re-encryption
- Rotation history tracking

**Access Controls:**
- Team accounts with role-based permissions
- Key approval workflows
- Audit trail for all key operations

**Backup & Recovery:**
- Encrypted backup export
- Recovery questions
- Multi-factor authentication for vault access

### 5.3 Advanced Developer Tools

**SDKs:**
- `@cryptokeygen/javascript` (npm package)
- `@cryptokeygen/python` (PyPI package)
- `@cryptokeygen/go` (Go module)

**CLI Tool:**
```bash
$ npm install -g @cryptokeygen/cli

$ crypto-gen generate rsa-4096 --format pem
$ crypto-gen encrypt --input file.txt --output file.enc
$ crypto-gen sign --input document.pdf
```

**Infrastructure as Code:**
- Terraform provider for HCP Vault
- Ansible modules for SSH key management
- Kubernetes operator for certificate rotation
- CI/CD plugins (GitHub Actions, GitLab CI)

### 5.4 Analytics & Monitoring

**Usage Dashboard:**
- Real-time request metrics
- Error rate tracking
- Performance monitoring
- Geographic distribution

**Security Event Tracking:**
- Suspicious activity detection
- Rate limit breach alerts
- Failed authentication attempts
- Anomaly detection (unusual patterns)

**Health Monitoring:**
- Uptime monitoring
- API response time tracking
- Database performance
- Error rate alerting

---

## Implementation Priority Summary

**Week 1:** GitHub Repository Optimization (Quick wins, high impact)

**Weeks 2-3:** App-Integrated SEO Content ("Why?" page, homepage enhancements)

**Week 4:** Quick Wins - User Delight (Copy improvements, loading states, tooltips)

**Weeks 5-6:** Developer Experience (Supabase integration, API routes, developer portal)

**Months 2-3:** Iterate based on user feedback, add high-demand features

**Months 4-6:** Enterprise Features (when product-market fit achieved)

---

## Success Metrics

**User Growth:**
- Monthly active users (MAU)
- Organic search traffic growth
- GitHub stars growth
- Backlink growth (SEO)

**Engagement:**
- Keys generated per session
- API adoption rate
- Return user rate
- Session duration

**Developer Adoption:**
- API key registrations
- API requests per day
- SDK downloads (if released)
- Integration examples usage

**Revenue (eventually):**
- Free → Pro conversion rate
- Enterprise leads
- Monthly recurring revenue (MRR)

---

## Technical Considerations

### Supabase Free Tier Limits

| Resource | Free Limit | Expected Usage | Upgrade Path |
|----------|------------|----------------|--------------|
| Database | 500MB | <10MB (users + logs) | Pro tier $25/mo |
| Bandwidth | 1GB | <100MB | Pro tier |
| Auth MAU | 50K | <1K initially | Pro tier |
| API Requests | Unlimited | N/A (Vercel) | N/A |

### Vercel Free Tier Limits

| Resource | Free Limit | Expected Usage | Upgrade Path |
|----------|------------|----------------|--------------|
| Bandwidth | 100GB | <10GB | Pro $20/mo |
| Execution | 6K min | <1K min | Pro $20/mo |
| Builds | Unlimited | ~100/month | N/A |

### Estimated Timeline

**Phase 1 (GitHub):** 1 week
**Phase 2 (SEO Content):** 2 weeks
**Phase 3 (Quick Wins):** 1 week
**Phase 4 (Supabase):** 2 weeks

**Total:** 6 weeks to fully featured MVP with developer API

### Risk Assessment

**Technical Risks:**
- Supabase downtime → Mitigation: Status page, graceful degradation
- Vercel execution limits → Mitigation: Caching, efficient code
- SEO competition → Mitigation: Focus on long-tail keywords, educational content

**Business Risks:**
- Slow user adoption → Mitigation: Measure weekly, iterate quickly
- High compute costs → Mitigation: Start with free tiers, monitor usage
- Security concerns → Mitigation: Transparency, audit reports, open source

---

## Next Steps

**Immediate actions:**
1. Create GitHub repository optimization PR
2. Set up Supabase project (free tier)
3. Create "Why?" page wireframe
4. Design developer portal mockups

**After this spec is approved:**
- Create detailed implementation plan using `superpowers:writing-plans`
- Execute plan using `superpowers:subagent-driven-development`
- Ship features incrementally, gather user feedback
