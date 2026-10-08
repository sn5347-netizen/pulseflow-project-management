import { createApp } from './app';
import { config } from './config';
import { ensureDemoData } from './seed';

const app = createApp();

app.listen(config.port, '0.0.0.0', async () => {
  console.log(`====================================================`);
  console.log(`🚀 PulseFlow API Server running at http://localhost:${config.port}`);
  console.log(`📚 Swagger Documentation at http://localhost:${config.port}/api/docs`);
  console.log(`🏥 Health Check at http://localhost:${config.port}/api/health`);
  console.log(`====================================================`);

  // Guarantee demo account & sample projects exist even after container restarts
  await ensureDemoData();
});

