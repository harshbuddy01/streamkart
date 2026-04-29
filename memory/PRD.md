# StreamKart — Product Requirements Document

## Original Problem Statement
"I want to create a website where I will be selling famous audiobooks, books and news collection and the audiobooks and books should be from international authors and my website name is streamkart"

## Direction (per user iterations)
- **Digital-only** — books read online, audiobooks streamed online, no physical shipping
- **News collection removed** — only Books & Audiobooks
- **INR base pricing** with **multi-currency display** auto-detected via `/api/geo`, manually overridable
- **Razorpay & Cashfree** payment options (currently MOCKED — no live keys provided)
- **Terms / Refund (no refunds after purchase) / Support** policy pages
- **Reader** for purchased titles (book reader + audiobook player)
- **JWT auth** (custom email/password) + **Support tickets** system

## Architecture
- Frontend: React 19 + Tailwind + shadcn/ui + react-router + sonner + axios
- Backend: FastAPI + Motor (async MongoDB), JWT auth via PyJWT + bcrypt
- DB collections: `products`, `orders`, `users`, `tickets`
- Currency: base INR, frontend `CurrencyProvider` formats; geo via `/api/geo` server-side proxy
- Auth: Bearer tokens in `localStorage`, axios interceptor adds `Authorization`

## User Personas
1. **International Reader** — discover & read famous global authors
2. **Audiobook Listener** — high-quality narrated editions
3. **Indian buyer** — sees ₹ pricing, pays via Razorpay/Cashfree
4. **Global buyer** — auto-converted local currency
5. **Customer with an issue** — opens a support ticket from their account

## Implemented Features (as of Apr 2026)
- **Catalog**: 34 products (24 books + 10 audiobooks) from 15 international authors with OpenLibrary covers
- **Home**: hero, author marquee, 2-pillar categories, featured grid, dark "Now Streaming" band, audiobook showcase, bestsellers
- **Browse + Search + Filter** by category & search query
- **Product detail** with rating, description, qty selector, add-to-cart, buy-now, no-refund link
- **Cart** (CartContext, localStorage) — qty/remove/subtotal in selected currency
- **Checkout** — Razorpay/Cashfree options (MOCKED), customer form, no-refund disclaimer
- **Order success** — "Your library is ready" + per-item Read/Listen buttons → reader
- **Reader (`/read/:orderId/:productId`)** — gated on `order.status='paid'` + product membership
  - **Book reader**: paginated chapters, theme switcher (paper/sepia/night), font sizes, prev/next
  - **Audiobook player**: cover art, play/pause, ±15s/±30s seek, speed (0.75–2×), track list
- **Auth (`/login`, `/register`)**: JWT-based, bcrypt-hashed, admin auto-seeded from .env
- **Support tickets (`/support`)**: logged-in users only — create with subject/category/order_id?/message; thread view with replies; auto-generated initial support response on creation
- **Header**: nav, search, currency dropdown (9 currencies), user avatar dropdown (Tickets/Sign out) or Sign in
- **Footer**: catalog + Support + Refund + Terms + Sign in
- **Policy pages**: `/policy/terms`, `/policy/refund`, `/policy/support`

## What's MOCKED
- **Razorpay payment gateway** — synthetic `rzp_mock_*` session id; 1.2s simulated delay; mock payment_id verified
- **Cashfree payment gateway** — synthetic `cf_mock_*` session id, same MOCKED flow
- **Reader content**: sample chapters generated from genre fragments + DEMO_AUDIO_URL from soundhelix.com (in production, licensed full text/audio served by publishers)

## Backlog
### P0 (next session)
- Connect **real Razorpay & Cashfree keys** (user provides) and wire actual checkout pop-ups
- Wire **email order confirmations** (Resend or SendGrid)
- Auth-gate the `/api/read/...` endpoint (currently public — defense-in-depth fix from iteration_4)

### P1
- User library page (lists all purchased titles regardless of order)
- Sample chapter preview on product detail (free first chapter)
- Reviews & ratings submission
- Wishlist / save-for-later
- Admin panel (catalog CRUD, ticket dashboard with reply)

### P2
- Real-time FX rates (currently static)
- Coupon codes & gift cards
- Recommendations engine
- Mobile app

## Tech Notes for Future Agents
- `useCurrency().format(inrAmount)` is the canonical price formatter
- `useAuth()` exposes `user, isAuthed, login, register, logout, loading`
- Bearer token key: `streamkart_token_v1`
- Cart key: `streamkart_cart_v1`
- Currency key: `streamkart_currency_v1`
- Backend reseeds products on empty `products` collection — drop collection to refresh
- Admin (`admin@streamkart.com`) seeded on startup; password synced from .env if changed

## Test Credentials
See `/app/memory/test_credentials.md`

## Test Reports
- `/app/test_reports/iteration_1.json` — initial backend+frontend
- `/app/test_reports/iteration_2.json` — INR + multi-currency, found 2 critical FE bugs
- `/app/test_reports/iteration_3.json` — bug fixes verified, 100%
- `/app/test_reports/iteration_4.json` — auth + tickets + reader 100% pass
