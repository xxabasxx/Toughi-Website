const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toFa(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

export function faNum(n: number | string): string {
  const num = Number(n);
  if (Number.isNaN(num)) return toFa(String(n));
  return new Intl.NumberFormat("fa-IR").format(num);
}

export function formatToman(n?: number | null): string {
  if (n === null || n === undefined) return "توافقی";
  if (n === 0) return "رایگان";
  return `${faNum(n)} تومان`;
}

export function priceShort(n?: number | null): string {
  if (n === null || n === undefined) return "توافقی";
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    const v = m >= 100 ? Math.round(m) : Math.round(m * 10) / 10;
    return `${faNum(v)} میلیون`;
  }
  if (n >= 1_000) return `${faNum(Math.round(n / 1_000) * 1000 === n ? n / 1_000 : n / 1000)} هزار`;
  return faNum(n);
}

export function timeAgoFa(input: Date | string | number): string {
  const date = new Date(input);
  const diff = Date.now() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "لحظاتی پیش";
  if (diff < hour) {
    const m = Math.floor(diff / minute);
    return m <= 1 ? "یک دقیقه پیش" : `${faNum(m)} دقیقه پیش`;
  }
  if (diff < day) {
    const h = Math.floor(diff / hour);
    return h <= 1 ? "یک ساعت پیش" : `${faNum(h)} ساعت پیش`;
  }
  if (diff < 30 * day) {
    const d = Math.floor(diff / day);
    return d <= 1 ? "دیروز" : `${faNum(d)} روز پیش`;
  }
  if (diff < 365 * day) {
    const mo = Math.floor(diff / (30 * day));
    return mo <= 1 ? "یک ماه پیش" : `${faNum(mo)} ماه پیش`;
  }
  const y = Math.floor(diff / (365 * day));
  return y <= 1 ? "یک سال پیش" : `${faNum(y)} سال پیش`;
}

export function formatDateFa(input: Date | string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(input));
}

export function faTime(input: Date | string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(input));
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function normalizePhone(input: string): string {
  const en = input.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d))).replace(/[^0-9+]/g, "");
  if (en.startsWith("+98")) return "0" + en.slice(3);
  if (en.startsWith("98")) return "0" + en.slice(2);
  return en;
}

export function isValidIranPhone(phone: string): boolean {
  return /^09\d{9}$/.test(phone);
}

export function parsePriceFa(input: string): number | null {
  const cleaned = input
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[^0-9]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
