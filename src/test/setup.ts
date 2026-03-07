// Test setup file — runs before every test.
// It adds extra "matchers" (checking functions) that make testing easier.

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Clean up after each test so components don't leak between tests
afterEach(() => {
  cleanup();
});
