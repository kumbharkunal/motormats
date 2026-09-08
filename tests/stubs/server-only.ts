// `server-only` ships a build that throws when resolved through a client
// condition, which is how Vite resolves it. Tests run in Node and are
// server-side by definition, so it is aliased to this no-op.
export {};
