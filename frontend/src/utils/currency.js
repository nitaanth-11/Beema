// Indian Rupee (INR) Currency Utilities for Beema Platform
export const RUPEE_SYMBOL = "₹";

/**
 * Formats a numeric value into Indian Rupees (INR) with proper comma grouping.
 * Example: 245000 -> "₹2,45,000.00" or "₹2,45,000"
 */
export function formatRupees(amount, options = {}) {
  const { includeDecimals = true, compact = false } = options;
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${RUPEE_SYMBOL}0${includeDecimals ? ".00" : ""}`;
  }

  const num = Number(amount);

  if (compact) {
    return formatRupeesCompact(num);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(num);
}

/**
 * Formats large Indian Rupee figures into Lakhs (L) and Crores (Cr) for executive dashboards.
 * Example: 4500000 -> "₹45.00 L", 125000000 -> "₹12.50 Cr"
 */
export function formatRupeesCompact(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${RUPEE_SYMBOL}0`;
  }
  const num = Number(amount);
  const abs = Math.abs(num);

  if (abs >= 10000000) {
    const cr = num / 10000000;
    return `${RUPEE_SYMBOL}${cr.toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    const lakh = num / 100000;
    return `${RUPEE_SYMBOL}${lakh.toFixed(2)} L`;
  }
  if (abs >= 1000) {
    const k = num / 1000;
    return `${RUPEE_SYMBOL}${k.toFixed(1)}k`;
  }
  return `${RUPEE_SYMBOL}${num.toLocaleString("en-IN")}`;
}

/**
 * Safely parses a string or number into an integer/float amount.
 */
export function parseRupees(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
