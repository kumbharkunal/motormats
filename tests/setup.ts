import { config as loadEnv } from 'dotenv';

// Integration tests talk to a real MySQL, so they need the same configuration
// the app uses. Loaded here rather than per-file so every suite agrees.
loadEnv({ path: '.env.development', quiet: true });
