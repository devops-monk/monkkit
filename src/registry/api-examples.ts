/**
 * Per-tool example request bodies for the API tab curl snippet.
 * Keyed by tool id (matches ToolDefinition.id).
 * Image tools are omitted — they are browser-only and have no API endpoint.
 */
export const API_EXAMPLES: Record<string, Record<string, unknown>> = {
  // ── JSON ──────────────────────────────────────────────────────────────────
  "json-validator": {
    json: '{"name": "Alice", "age": 30, "active": true}',
  },
  "json-formatter": {
    json: '{"name":"Alice","age":30,"active":true}',
    indent: 2,
  },
  "json-minify": {
    json: '{\n  "name": "Alice",\n  "age": 30\n}',
  },
  "json-escape": {
    json: '{"message": "Hello \"World\"", "path": "C:\\\\Users\\\\Alice"}',
  },
  "json-unescape": {
    json: '"{\"message\": \"Hello \\\"World\\\"\"}"',
  },
  "json-repair": {
    json: "{name: 'Alice', age: 30, active: true,}",
  },
  "json-diff": {
    a: '{"name": "Alice", "age": 30}',
    b: '{"name": "Alice", "age": 31, "city": "Paris"}',
  },
  "json-flatten": {
    json: '{"user": {"name": "Alice", "address": {"city": "Paris"}}}',
    separator: ".",
  },
  "json-unflatten": {
    json: '{"user.name": "Alice", "user.address.city": "Paris"}',
    separator: ".",
  },
  "json-sort": {
    json: '{"zebra": 3, "apple": 1, "mango": 2}',
    order: "asc",
  },
  "json-stringify": {
    json: '{"name": "Alice", "score": 99}',
  },
  "json-search": {
    json: '{"users": [{"name": "Alice"}, {"name": "Bob"}]}',
    query: "Alice",
  },
  "json-size": {
    json: '{"name": "Alice", "age": 30}',
  },
  "json-token-count": {
    json: '{"name": "Alice", "age": 30}',
  },
  "json-jsonpath": {
    json: '{"store": {"books": [{"title": "Moby Dick", "price": 8.99}, {"title": "1984", "price": 7.99}]}}',
    path: "$.store.books[*].title",
  },
  "json-jwt-decode": {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNzE2NDIyNDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  },
  "json-schema-generate": {
    json: '{"name": "Alice", "age": 30, "active": true, "tags": ["admin", "user"]}',
  },
  "json-schema-validate": {
    json: '{"name": "Alice", "age": 30}',
    schema:
      '{"type": "object", "required": ["name", "age"], "properties": {"name": {"type": "string"}, "age": {"type": "integer", "minimum": 0}}}',
  },
  "json-from-yaml": {
    yaml: "name: Alice\nage: 30\nactive: true\ntags:\n  - admin\n  - user",
  },
  "json-from-xml": {
    xml: "<user><name>Alice</name><age>30</age><active>true</active></user>",
  },
  "json-from-csv": {
    csv: "name,age,city\nAlice,30,Paris\nBob,25,London",
  },
  "json-to-yaml": {
    json: '{"name": "Alice", "age": 30, "tags": ["admin", "user"]}',
  },
  "json-to-xml": {
    json: '{"user": {"name": "Alice", "age": 30}}',
    root: "root",
  },
  "json-to-csv": {
    json: '[{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]',
  },
  "json-to-toml": {
    json: '{"title": "Example", "database": {"host": "localhost", "port": 5432}}',
  },
  "json-to-typescript": {
    json: '{"name": "Alice", "age": 30, "active": true}',
    typeName: "User",
  },
  "json-to-python": {
    json: '{"name": "Alice", "age": 30, "active": true}',
    className: "User",
  },
  "json-to-golang": {
    json: '{"name": "Alice", "age": 30, "active": true}',
    structName: "User",
  },
  "json-to-java": {
    json: '{"name": "Alice", "age": 30, "active": true}',
    className: "User",
  },
  "json-to-rust": {
    json: '{"name": "Alice", "age": 30, "active": true}',
    structName: "User",
  },
  "json-to-csharp": {
    json: '{"name": "Alice", "age": 30, "active": true}',
    className: "User",
  },
  "json-to-zod": {
    json: '{"name": "Alice", "age": 30, "active": true}',
    schemaName: "userSchema",
  },
  "json-to-sql": {
    json: '[{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]',
    table: "users",
  },

  // ── GENERATORS ────────────────────────────────────────────────────────────
  "generators-qr-code": {
    text: "https://tools.devops-monk.com",
    size: 300,
    errorCorrectionLevel: "M",
  },
  "generators-password": {
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    count: 5,
  },
  "generators-barcode": {
    text: "9780201379624",
    format: "EAN13",
  },

  // ── ENCODING ──────────────────────────────────────────────────────────────
  "encoding-base64": {
    text: "Hello, World!",
    action: "encode",
  },
  "encoding-base32": {
    text: "Hello, World!",
    action: "encode",
  },
  "encoding-hex": {
    text: "Hello, World!",
    action: "encode",
  },
  "encoding-binary": {
    text: "Hello",
    action: "encode",
  },
  "encoding-url-encode": {
    text: "https://example.com/path?q=hello world&lang=en",
    action: "encode",
  },
  "encoding-html-entities": {
    text: "<p>Hello & \"World\"</p>",
    action: "encode",
  },
  "encoding-charcode": {
    text: "Hello",
    action: "encode",
  },
  "encoding-hash": {
    text: "hello world",
    algorithm: "SHA-256",
  },
  "encoding-hmac": {
    text: "hello world",
    key: "my-secret-key",
    algorithm: "SHA-256",
  },

  // ── CRYPTOGRAPHY ──────────────────────────────────────────────────────────
  "crypto-caesar": {
    text: "Hello World",
    shift: 13,
    action: "encode",
  },
  "crypto-rot47": {
    text: "Hello World!",
    action: "encode",
  },
  "crypto-vigenere": {
    text: "Hello World",
    key: "SECRET",
    action: "encode",
  },
  "crypto-atbash": {
    text: "Hello World",
  },
  "crypto-morse": {
    text: "HELLO WORLD",
    action: "encode",
  },
  "crypto-nato": {
    text: "Hello World",
    action: "encode",
  },
  "crypto-a1z26": {
    text: "Hello World",
    action: "encode",
  },
  "crypto-xor": {
    text: "Hello World",
    key: "42",
    action: "encode",
  },

  // ── CERTIFICATES ──────────────────────────────────────────────────────────
  "certificates-cert-decoder": {
    pem: "-----BEGIN CERTIFICATE-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END CERTIFICATE-----",
  },
  "certificates-cert-fingerprint": {
    pem: "-----BEGIN CERTIFICATE-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END CERTIFICATE-----",
    algorithms: ["SHA-1", "SHA-256"],
  },
  "certificates-csr-decoder": {
    pem: "-----BEGIN CERTIFICATE REQUEST-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END CERTIFICATE REQUEST-----",
  },
  "certificates-csr-generator": {
    commonName: "example.com",
    organization: "Acme Inc",
    country: "US",
    state: "California",
    keySize: 2048,
  },
  "certificates-pem-converter": {
    pem: "-----BEGIN CERTIFICATE-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END CERTIFICATE-----",
    targetFormat: "DER",
  },
  "certificates-self-signed-generator": {
    commonName: "example.com",
    organization: "Acme Inc",
    country: "US",
    validityDays: 365,
    keySize: 2048,
  },

  // ── NETWORK ───────────────────────────────────────────────────────────────
  "network-dns-lookup": {
    domain: "example.com",
    type: "A",
  },
  "network-whois": {
    domain: "example.com",
  },
  "network-subnet-calc": {
    cidr: "192.168.1.0/24",
  },
  "network-blacklist-check": {
    ip: "8.8.8.8",
  },
  "network-http-headers": {
    url: "https://example.com",
  },
  "network-my-ip": {},
  "network-dns-propagation": {
    domain: "example.com",
    type: "A",
  },
  "network-asn-lookup": {
    ip: "1.1.1.1",
  },
  "network-ip-in-subnet": {
    ip: "192.168.1.100",
    subnet: "192.168.1.0/24",
  },
  "network-ip-parser": {
    ip: "192.168.1.1",
  },
  "network-url-parser": {
    url: "https://user:pass@example.com:8080/path?q=hello&lang=en#section",
  },
  "network-defang": {
    text: "https://malicious.example.com and 192.168.1.1",
    action: "defang",
  },
  "network-mac-lookup": {
    mac: "00:1A:2B:3C:4D:5E",
  },
  "network-extract-ips": {
    text: "Server at 192.168.1.1 and backup at 10.0.0.254, IPv6: 2001:db8::1",
  },
  "network-extract-urls": {
    text: "Visit https://example.com or http://docs.example.org/guide for more info.",
  },
  "network-extract-emails": {
    text: "Contact alice@example.com or support@devops-monk.com for help.",
  },

  // ── EMAIL ─────────────────────────────────────────────────────────────────
  "email-mx-lookup": {
    domain: "gmail.com",
  },
  "email-spf-lookup": {
    domain: "gmail.com",
  },
  "email-dmarc-lookup": {
    domain: "gmail.com",
  },
  "email-dkim-lookup": {
    domain: "gmail.com",
    selector: "google",
  },
  "email-bimi-lookup": {
    domain: "gmail.com",
  },
  "email-mta-sts": {
    domain: "gmail.com",
  },
  "email-tlsrpt": {
    domain: "gmail.com",
  },
  "email-header-analyzer": {
    headers:
      "Delivered-To: alice@example.com\nReceived: from mail.example.com (mail.example.com [203.0.113.1])\n  by mx.example.com with ESMTPS; Thu, 22 May 2026 10:00:00 +0000\nFrom: bob@example.com\nTo: alice@example.com\nSubject: Hello\nDate: Thu, 22 May 2026 10:00:00 +0000\nAuthentication-Results: mx.example.com;\n  spf=pass smtp.mailfrom=example.com;\n  dkim=pass header.d=example.com;\n  dmarc=pass",
  },
  "email-spf-generator": {
    domain: "example.com",
    includeDomains: ["_spf.google.com", "sendgrid.net"],
    allowMx: true,
    allowA: false,
    ipRanges: ["203.0.113.0/24"],
    policy: "~all",
  },
  "email-dmarc-generator": {
    domain: "example.com",
    policy: "quarantine",
    subdomainPolicy: "reject",
    percentage: 100,
    reportEmail: "dmarc-reports@example.com",
    spfAlignment: "relaxed",
    dkimAlignment: "relaxed",
  },
  "email-domain-health": {
    domain: "gmail.com",
  },

  // ── TEXT ──────────────────────────────────────────────────────────────────
  "text-word-count": {
    text: "The quick brown fox jumps over the lazy dog.",
  },
  "text-case-converter": {
    text: "hello world from devops monk",
    targetCase: "camelCase",
  },
  "text-reverse": {
    text: "Hello, World!",
  },
  "text-sort-lines": {
    text: "banana\napple\ncherry\ndate",
    order: "asc",
  },
  "text-remove-duplicates": {
    text: "apple\nbanana\napple\ncherry\nbanana",
  },
  "text-find-replace": {
    text: "Hello World. Hello everyone.",
    find: "Hello",
    replace: "Hi",
    replaceAll: true,
  },
  "text-filter-lines": {
    text: "error: disk full\ninfo: started\nwarn: high memory\nerror: timeout",
    filter: "error",
    mode: "include",
  },
  "text-add-line-numbers": {
    text: "First line\nSecond line\nThird line",
    startAt: 1,
  },

  // ── DATETIME ──────────────────────────────────────────────────────────────
  "datetime-unix-timestamp": {
    timestamp: 1716422400,
  },
  "datetime-date-diff": {
    from: "2026-01-01",
    to: "2026-05-23",
  },
};
