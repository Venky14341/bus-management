import { app } from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Bus Booking Management System API Server`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`📚 Swagger Docs: http://localhost:${config.port}/api-docs`);
  console.log(`=======================================================`);
});

export default server;
