# Taplify Connect

Digital business cards with shareable profile links, QR codes, NFC activation,
contact exchange, and analytics.

## Getting started

1. Copy `.env.example` to `.env.local`.
2. Set `DATABASE_URL` and `AUTH_SECRET`. Google OAuth and NFC provisioning
   credentials are optional for local development.
3. Install dependencies, apply migrations, and start Next.js:

```bash
npm install
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

## NFC inventory and activation

Physical tags are provisioned before they are shipped. Configure
`NFC_PROVISIONING_SECRET`, then use the protected endpoint to create inventory
records:

```http
POST /api/nfc/provision
x-provisioning-secret: <NFC_PROVISIONING_SECRET>
Content-Type: application/json

{"quantity":1,"tagType":"NTAG215"}
```

For each returned item, write its `tapUrl` to the NFC tag and securely include
its one-time `activationCode` with the corresponding order. Customers activate
the tag from a published business card or the NFC Cards page; activation
assigns it to that card automatically. The tap URL stays the same if the card
destination is later changed.

The app implements inventory provisioning and activation, but does not include
store checkout, payment processing, or order/fulfillment integration. The
provisioning endpoint should only be called by trusted fulfillment tooling.
