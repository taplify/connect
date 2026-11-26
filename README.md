# Taplify Connect

Digital business cards with shareable profile links, QR codes, NFC activation,
contact exchange, and analytics.

## Getting started

1. Copy `.env.example` to `.env.local`.
2. Set `DATABASE_URL` and `AUTH_SECRET`. Google OAuth and NFC provisioning
   credentials are optional for local development. Set Stripe test keys to try
   the physical-card checkout.
3. Install dependencies, apply migrations, and start Next.js:

```bash
npm install
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

## NFC orders and test payments

The NFC store uses Stripe Checkout in test mode. The default product is one
Taplify NFC card for USD 19.99, with shipping included and delivery restricted
to Malaysia. Adjust `NFC_CARD_PRICE_CENTS`, `NFC_CARD_CURRENCY`, and
`NFC_CARD_SHIPPING_COUNTRIES` to change those settings. Prices are specified in
the currency's smallest unit (for example, 1999 for USD 19.99).

Add your Stripe **test-mode** secret key to `STRIPE_SECRET_KEY`. Do not paste
Stripe keys into source control or chat. For local webhook testing, install and
sign in to the Stripe CLI, then run:

```bash
stripe listen --events checkout.session.completed,checkout.session.expired --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` value printed by the CLI into `STRIPE_WEBHOOK_SECRET` and
restart Next.js. The webhook handles completed and expired Checkout sessions.
For Vercel, add the same test-mode keys and app URL to the project environment,
then create a test-mode webhook endpoint at
`https://<your-domain>/api/stripe/webhook` for
`checkout.session.completed` and `checkout.session.expired`.

Physical NFC tags must be provisioned and encoded before they can be sold.
Configure `NFC_PROVISIONING_SECRET`, then use the protected endpoint to create
tag records:

```http
POST /api/nfc/provision
x-provisioning-secret: <NFC_PROVISIONING_SECRET>
Content-Type: application/json

{"quantity":1,"tagType":"NTAG215"}
```

Write each returned `tapUrl` to its physical NFC tag and test it. Only after
the tag is encoded and verified, mark it as ready for sale:

```http
POST /api/nfc/provision/ready
x-provisioning-secret: <NFC_PROVISIONING_SECRET>
Content-Type: application/json

{"identifiers":["<identifier from the provisioning response>"]}
```

When a signed-in customer checks out from the NFC Cards page, the app reserves
one ready tag and links it to their selected published profile after Stripe
confirms payment. No activation code is needed for this purchase flow. The tag's
URL remains the same if the customer later changes the linked profile.

To test a purchase, configure Stripe test keys and a webhook as described above,
provision at least one tag, then complete checkout with Stripe's test card
`4242 4242 4242 4242` and any future expiry date and CVC. Test mode does not
charge a real card. The app records the shipping address and order status, but
packing, shipping, tracking numbers, refunds, and customer shipping emails still
need to be handled manually.

For gift or separately purchased tags, the existing one-time activation-code
flow remains available. Codes are only shown by the provisioning endpoint and
are stored as hashes. Keep the provisioning response secure; the activation
code cannot be retrieved later.
