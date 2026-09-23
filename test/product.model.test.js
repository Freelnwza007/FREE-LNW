const test = require("node:test");
const assert = require("node:assert/strict");
const Product = require("../src/models/product.model");

const validProduct = () => new Product({
  name: "Test Espresso",
  description: "Test product",
  productType: "coffee",
  variants: [{ sku: "TEST-ESP", size: "Regular", price: 95, stock: 10 }],
});

test("product model accepts a valid admin product", () => {
  const error = validProduct().validateSync();
  assert.equal(error, undefined);
});

test("product model requires at least one purchasable variant", () => {
  const product = validProduct();
  product.variants = [];
  const error = product.validateSync();
  assert.ok(error.errors.variants);
});

test("product model rejects negative price", () => {
  const product = validProduct();
  product.variants[0].price = -1;
  const error = product.validateSync();
  assert.ok(error.errors["variants.0.price"]);
});
