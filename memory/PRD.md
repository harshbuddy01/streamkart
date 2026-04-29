# StreamKart — Product Requirements Document

## Original Problem Statement
"I want to create a website where I will be selling famous audiobooks, books and news collection and the audiobooks and books should be from international authors and my website name is streamkart"

## Updated Direction (per user iterations)
- **Digital-only** — books read online, audiobooks streamed online, no physical shipping
- **Removed news collection** — only Books & Audiobooks now
- **INR base pricing** with **multi-currency display** auto-detected from visitor location, manually overridable
- **Razorpay & Cashfree** as payment options (currently MOCKED end-to-end — no real keys provided)
- **Terms / Refund (no refunds after purchase) / Support** policy pages

## Architecture
- Frontend: React 19 + TailwindCSS + shadcn/ui + react-router-dom + sonner toasts
- Backend: FastAPI + Motor (async MongoDB) — all routes under `/api`
- DB: MongoDB (`streamkart` collections: `products`, `orders`)
- Currency: base INR in DB; frontend `CurrencyProvider` converts via static FX table for INR/USD/GBP/EUR/AUD/CAD/AED/SGD/JPY
- Geo detection: `/api/geo` proxy → ipapi.co (server-side to avoid browser CORS)

## User Personas
1. **International Reader** — wants to discover and read famous global authors (Murakami, Márquez, Adichie, Roy, Rushdie, Hosseini)
2. **Audiobook Listener** — wants high-quality narrated editions
3. **Indian buyer** — sees ₹ pricing, pays via Razorpay/Cashfree
4. **Global buyer** — sees prices auto-converted to local currency

## Implemented Features (as of Apr 2026)
- 34 seeded products: 24 books + 10 audiobooks from 15 international authors, OpenLibrary cover images
- Home: hero, author marquee, category pillars (Books/Audiobooks), featured grid, dark "Now Streaming" band, audiobook showcase, bestsellers
- Browse + filter (category, search) with empty-state
- Product detail page with cover, rating, description, qty selector, add-to-cart, buy-now
- Cart page (localStorage-persisted via CartContext) with qty/remove/subtotal
- Checkout with Razorpay/Cashfree payment options (MOCKED), customer form validation, "no refund" disclaimer
- Order success page ("Your library is ready") fetching order from backend
- Policy pages: `/policy/terms`, `/policy/refund`, `/policy/support`
- Multi-currency selector in header (9 currencies); prices update site-wide; localStorage persisted
- Auto-detect currency via backend `/api/geo` proxy on first visit
- Test IDs on all interactive elements

## What's MOCKED
- **Razorpay payment gateway** — backend returns synthetic `rzp_mock_*` session id; frontend simulates 1.2s delay then calls `/api/orders/verify` with a synthetic payment_id
- **Cashfree payment gateway** — same MOCKED pattern with `cf_mock_*` session id
- **Reading/streaming surface** — clicking "Read" doesn't open an actual reader yet (post-purchase library not implemented)

## Backlog
### P0 (next session)
- Connect real Razorpay & Cashfree keys (user provides) and wire actual checkout pop-ups
- Add a simple reader page (`/read/:order_id/:product_id`) that gates on order.status=paid
- Email order confirmation (Resend or SendGrid)

### P1
- User accounts / library page listing all purchased titles
- "Sample chapter" preview on product detail
- Reviews & ratings submission
- Wishlist
- Admin panel for catalog CRUD

### P2
- Real-time FX rate updates (currently static table)
- Coupon codes & gift cards
- Recommendations engine
- Mobile app

## Tech Notes for Future Agents
- Currency context lives in `/app/frontend/src/lib/currency.jsx` — `useCurrency().format(inrAmount)` is the canonical price formatter; everything else is a bug
- Cart context in `/app/frontend/src/lib/cart.jsx` — items stored by `product_id`
- Backend seeds on startup if `products` collection is empty — to re-seed, drop the collection and restart backend
- All MongoDB queries exclude `_id` via projection `{"_id": 0}`
- Razorpay amount is in paise (INR × 100); base prices are INR rupees

## Test Credentials
n/a — no auth implemented

## Test Reports
- `/app/test_reports/iteration_1.json` — 17/17 backend, frontend partial (testid issues)
- `/app/test_reports/iteration_2.json` — 18/18 backend, found 2 critical FE bugs (currency on cards, checkout redirect)
- `/app/test_reports/iteration_3.json` — All FE fixes verified, 100% pass
