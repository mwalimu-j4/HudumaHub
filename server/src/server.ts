import app from "./app";
import { env } from "./config/env";
import { dbReady } from "./lib/db-pool";

const PORT = env.PORT;

// Wait for split-schema initialization before accepting requests
dbReady.then(() => {
  app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════╗
  ║          🏛️  HudumaHub API           ║
  ║                                       ║
  ║  Server:  http://localhost:${PORT}       ║
  ║  Health:  http://localhost:${PORT}/api/health ║
  ║  Mode:    ${env.NODE_ENV.padEnd(24)}║
  ╚═══════════════════════════════════════╝
    `);
  });
});
