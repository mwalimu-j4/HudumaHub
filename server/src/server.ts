import app from "./app";
import { env } from "./config/env";

const PORT = env.PORT;

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
