import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the path to the .env file relative to this file
// This assumes .env is in the parent directory of src/config (i.e., server/.env)
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'habithero',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool; 