/**
 * Compatibility shims for running the project's legacy dependencies on newer
 * Node.js versions.
 *
 * Node >=22 removed the deprecated `buffer.SlowBuffer` API, but some old
 * transitive dependencies (e.g. `buffer-equal-constant-time`, pulled in by
 * `jsonwebtoken` / `passport-jwt`) still reference it at module-load time and
 * crash without it. Aliasing it to `Buffer` keeps those packages working.
 *
 * This file must be imported before any dependency that relies on the shimmed
 * APIs. It is a safe no-op on the project's supported Node versions (>=12).
 */
const buffer = require('buffer');

if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}
