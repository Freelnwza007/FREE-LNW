const crypto = require("crypto");

const toBase64Url = (value) => Buffer.from(value)
  .toString("base64")
  .replace(/=/g, "")
  .replace(/\+/g, "-")
  .replace(/\//g, "_");

const fromBase64Url = (value) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf8");
};

const getSecret = () => process.env.JWT_SECRET || "change-this-development-secret";

const createToken = (payload) => {
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = toBase64Url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }));
  const signature = crypto.createHmac("sha256", getSecret()).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
};

const verifyToken = (token) => {
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) throw new Error("Invalid token");

  const expectedSignature = crypto.createHmac("sha256", getSecret()).update(`${header}.${body}`).digest("base64url");
  if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error("Invalid token");
  }

  const payload = JSON.parse(fromBase64Url(body));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) throw new Error("Token expired");
  return payload;
};

module.exports = { createToken, verifyToken };
