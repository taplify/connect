import { timingSafeEqual } from "node:crypto";

export function isNfcProvisioningAuthorized(request: Request) {
  const configuredSecret = process.env.NFC_PROVISIONING_SECRET;
  const providedSecret = request.headers.get("x-provisioning-secret");
  if (!configuredSecret || !providedSecret) return false;

  const configured = Buffer.from(configuredSecret);
  const provided = Buffer.from(providedSecret);
  return (
    configured.length === provided.length &&
    timingSafeEqual(configured, provided)
  );
}
