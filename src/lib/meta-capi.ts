import crypto from "crypto";
import { type NextRequest } from "next/server";

/**
 * Meta Conversions API — shared helpers for building Lead/Schedule payloads.
 *
 * EMQ (Event Match Quality) is driven by how many user-data fields Meta can
 * match against. Sending email alone scores ~5/10; adding hashed phone +
 * name + IP + UA + fbp typically pushes EMQ to 8-9/10, which materially
 * improves attribution on iOS where the browser pixel is often blocked.
 *
 * Normalization rules per Meta's CAPI spec:
 *   em — lowercase + trim, then SHA-256
 *   ph — digits only (country code + number), then SHA-256
 *   fn / ln — lowercase, trim, no punctuation/whitespace, then SHA-256
 *   fbp — raw `_fbp` cookie value, NO hash
 *   fbc — `fb.1.{eventTime}.{fbclid}` or `_fbc` cookie, NO hash
 *   client_ip_address — raw, NO hash
 *   client_user_agent — raw, NO hash
 */

interface UserPayload {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  /** fbclid query param (preferred when there's no `_fbc` cookie yet). */
  fbclid?: string;
}

export interface MetaUserData {
  em?: string[];
  ph?: string[];
  fn?: string[];
  ln?: string[];
  fbp?: string;
  fbc?: string;
  client_ip_address?: string;
  client_user_agent?: string;
}

/**
 * Build a fully-populated `user_data` block for a Meta CAPI event. Pulls IP,
 * UA, and `_fbp` / `_fbc` cookies from the request. Hashes everything that
 * needs hashing per Meta's spec. Skips any field whose source value is empty.
 */
export async function buildMetaUserData(
  request: NextRequest,
  payload: UserPayload,
  eventTime: number,
): Promise<MetaUserData> {
  const userData: MetaUserData = {};

  if (payload.email) {
    userData.em = [await hashSHA256(payload.email.toLowerCase().trim())];
  }

  if (payload.phone) {
    const phoneDigits = payload.phone.replace(/\D/g, "");
    if (phoneDigits) {
      userData.ph = [await hashSHA256(phoneDigits)];
    }
  }

  if (payload.firstName) {
    const fn = payload.firstName.toLowerCase().replace(/[^a-z]/g, "");
    if (fn) userData.fn = [await hashSHA256(fn)];
  }

  if (payload.lastName) {
    const ln = payload.lastName.toLowerCase().replace(/[^a-z]/g, "");
    if (ln) userData.ln = [await hashSHA256(ln)];
  }

  // fbc: prefer the `_fbc` cookie Meta sets itself (already formatted).
  // Fall back to constructing from a raw fbclid query param.
  const fbcCookie = request.cookies.get("_fbc")?.value;
  if (fbcCookie) {
    userData.fbc = fbcCookie;
  } else if (payload.fbclid) {
    userData.fbc = `fb.1.${eventTime}.${payload.fbclid}`;
  }

  // fbp: browser ID cookie. Set by the Meta pixel on first pageview.
  const fbpCookie = request.cookies.get("_fbp")?.value;
  if (fbpCookie) userData.fbp = fbpCookie;

  // IP: x-forwarded-for is comma-separated when behind multiple proxies;
  // the first entry is the original client.
  const xff = request.headers.get("x-forwarded-for");
  const ip = xff?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip");
  if (ip) userData.client_ip_address = ip;

  const ua = request.headers.get("user-agent");
  if (ua) userData.client_user_agent = ua;

  return userData;
}

export async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
