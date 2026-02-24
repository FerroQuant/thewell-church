# Cloudflare Setup — DNS Migration, Worker Deploy, Facebook App

## 1. DNS Migration (Registrar → Cloudflare)

1. Create free Cloudflare account at https://dash.cloudflare.com/sign-up
2. Click **Add a site** → enter `thewell-church.com`
3. Select the **Free** plan
4. Cloudflare scans existing DNS — verify records appear (A records for GitHub Pages IPs, CNAME for www)
5. Cloudflare gives you 2 nameservers — update at your domain registrar
6. Wait for propagation (usually <1 hour, max 48h)
7. In Cloudflare dashboard: **SSL/TLS** → set to **Full**
8. Verify: `curl -I https://thewell-church.com` → should show a `cf-ray` header

## 2. Form Handler Worker Deployment

```bash
# Install wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set secrets (email recipients, Turnstile key)
cd workers/form-handler
wrangler secret put TURNSTILE_SECRET
wrangler secret put TO_ADDRESS
wrangler secret put CC_ADDRESSES
wrangler secret put FROM_ADDRESS
wrangler secret put FROM_NAME

# Deploy
wrangler deploy
```

## 3. Facebook App Setup (for live status)

1. Go to https://developers.facebook.com → **Create App** → **Business** type
2. Add the **Webhooks** product
3. Subscribe to field: `live_videos` for the Page
4. Callback URL: `https://thewell-church.com/api/live-status`
5. Set verify token (same as `VERIFY_TOKEN` Worker secret)

## 4. Email — Cloudflare Email Routing + Gmail

1. In Cloudflare dashboard → **Email** → **Email Routing** → **Get started**
2. Add routing rules for church email addresses → forward to personal Gmail
3. Verify forwarding destinations
4. Configure Gmail "Send As" for outgoing email (see Gmail → Settings → Accounts and Import)
5. Add SPF and DMARC DNS records for deliverability

### Long-term: Google Workspace for Nonprofits (free)

If registered UK charity, apply via https://www.charitydigital.org.uk/ for free Google Workspace.

## 5. Verification Checklist

- [ ] `curl -I https://thewell-church.com` shows `cf-ray` header
- [ ] Site loads normally (all pages, images, CSS)
- [ ] Form submissions work (test contact page)
- [ ] Email delivery working
- [ ] SSL certificate valid (no browser warnings)
