import { describe, it, expect } from "vitest";
import { WAF_PATTERNS } from "@/constants/waf-rules";

// ── WAF-SQLi ──────────────────────────────────────────────────────
describe("WAF-SQLi pattern", () => {
  const p = WAF_PATTERNS["WAF-SQLi"];

  it("matches classic OR-based injection", () => {
    expect(p.test("' OR 1=1")).toBe(true);
    expect(p.test("admin' OR a=a")).toBe(true);
  });

  it("matches comment-based injection", () => {
    expect(p.test("admin'--")).toBe(true);
    expect(p.test("admin'; --")).toBe(true);
  });

  it("matches UNION SELECT statement", () => {
    expect(p.test("UNION SELECT * FROM users")).toBe(true);
    expect(p.test("union select password")).toBe(true);
  });

  it("matches destructive statements", () => {
    expect(p.test("DROP TABLE users")).toBe(true);
    expect(p.test("INSERT INTO users VALUES")).toBe(true);
    expect(p.test("DELETE FROM sessions")).toBe(true);
  });

  it("matches extended stored procedure patterns", () => {
    expect(p.test("xp_cmdshell")).toBe(true);
    expect(p.test("xp_regread")).toBe(true);
  });

  it("matches inline comment blocks", () => {
    expect(p.test("SELECT/*comment*/1")).toBe(true);
  });

  it("does not match clean URL paths", () => {
    expect(p.test("/api/heartbeat")).toBe(false);
    expect(p.test("/console")).toBe(false);
    expect(p.test("?q=search+term")).toBe(false);
    expect(p.test("?page=2&sort=asc")).toBe(false);
  });
});

// ── WAF-XSS ───────────────────────────────────────────────────────
describe("WAF-XSS pattern", () => {
  const p = WAF_PATTERNS["WAF-XSS"];

  it("matches script tag injection", () => {
    expect(p.test("<script>alert(1)</script>")).toBe(true);
    expect(p.test('<script src="evil.js">')).toBe(true);
  });

  it("matches javascript: protocol", () => {
    expect(p.test("javascript:alert(1)")).toBe(true);
    expect(p.test("href=javascript:void(0)")).toBe(true);
  });

  it("matches inline event handler injection", () => {
    expect(p.test('onerror="alert(1)"')).toBe(true);
    expect(p.test("onload='steal()'")).toBe(true);
  });

  it("matches iframe injection", () => {
    expect(p.test('<iframe src="evil.com">')).toBe(true);
  });

  it("matches cookie theft patterns", () => {
    expect(p.test("document.cookie")).toBe(true);
  });

  it("matches eval-based execution", () => {
    expect(p.test('eval(atob("..."))')).toBe(true);
  });

  it("does not match clean requests", () => {
    expect(p.test("/console")).toBe(false);
    expect(p.test("?search=hello+world")).toBe(false);
    expect(p.test("Content-Type: application/json")).toBe(false);
  });
});

// ── WAF-PATH ──────────────────────────────────────────────────────
describe("WAF-PATH pattern", () => {
  const p = WAF_PATTERNS["WAF-PATH"];

  it("matches unix path traversal", () => {
    expect(p.test("../etc/passwd")).toBe(true);
    expect(p.test("../../etc/shadow")).toBe(true);
  });

  it("matches windows path traversal", () => {
    expect(p.test("..\\windows\\system32")).toBe(true);
  });

  it("matches URL-encoded traversal", () => {
    expect(p.test("%2e%2e%2fetc%2fpasswd")).toBe(true);
    expect(p.test("..%2fpasswd")).toBe(true);
    expect(p.test("%252e%252e")).toBe(true);
  });

  it("does not match clean paths", () => {
    expect(p.test("/console")).toBe(false);
    expect(p.test("/api/heartbeat")).toBe(false);
    expect(p.test("/api/ai/stream")).toBe(false);
  });
});

// ── WAF-BOT ───────────────────────────────────────────────────────
describe("WAF-BOT pattern", () => {
  const p = WAF_PATTERNS["WAF-BOT"];

  it("matches known scraper and crawler bots", () => {
    expect(p.test("Scrapy/2.0 (+https://scrapy.org)")).toBe(true);
    expect(p.test("Mozilla/5.0 (compatible; AhrefsBot/7.0)")).toBe(true);
    expect(p.test("SemrushBot/7~bl")).toBe(true);
    expect(p.test("DotBot/1.1")).toBe(true);
    expect(p.test("MJ12bot/v1.4.8")).toBe(true);
  });

  it("matches security scanner signatures", () => {
    expect(p.test("masscan/1.0 (https://github.com/robertdavidgraham/masscan)")).toBe(true);
    expect(p.test("zgrab/0.x")).toBe(true);
  });

  it("does not match legitimate browser user agents", () => {
    const chrome =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const safari =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
    const firefox =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0";
    expect(p.test(chrome)).toBe(false);
    expect(p.test(safari)).toBe(false);
    expect(p.test(firefox)).toBe(false);
  });
});
