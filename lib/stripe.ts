import Stripe from "stripe";

export class StripeConfigurationError extends Error {}

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey?.startsWith("sk_test_")) {
    throw new StripeConfigurationError(
      "Configure a Stripe test-mode secret key (sk_test_...).",
    );
  }

  return new Stripe(secretKey);
}

export function getNfcStoreConfig() {
  const priceCents = Number(process.env.NFC_CARD_PRICE_CENTS ?? "1999");
  const currency = (process.env.NFC_CARD_CURRENCY ?? "usd").toLowerCase();
  const countries = (process.env.NFC_CARD_SHIPPING_COUNTRIES ?? "MY")
    .split(",")
    .map((country) => country.trim().toUpperCase())
    .filter(Boolean);

  if (
    !Number.isSafeInteger(priceCents) ||
    priceCents < 50 ||
    !/^[a-z]{3}$/.test(currency) ||
    countries.length === 0 ||
    countries.some((country) => !/^[A-Z]{2}$/.test(country))
  ) {
    throw new StripeConfigurationError(
      "NFC price, currency, or shipping-country configuration is invalid.",
    );
  }

  return {
    priceCents,
    currency,
    shippingCountries:
      countries as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
  };
}
