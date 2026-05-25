import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';

console.log('Imports successful');
dotenv.config();
console.log('Dotenv configured');
const app = express();
app.use(cors());
console.log('Express and Cors setup');
const PORT = 5000;
app.listen(PORT, () => {
  console.log('Server listening on ' + PORT);
  process.exit(0);
});
