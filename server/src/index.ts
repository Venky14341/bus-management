import { app } from './app';
import { config } from './config';

const PORT = config.port;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Bus Booking Management System API Server`);
  console.log(`📡 Listening on: ${HOST}:${PORT}`);
  console.log(`📚 Swagger Docs: /api-docs`);
  console.log(`=======================================================`);
});

export default server;
