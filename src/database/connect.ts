import { Client } from 'pg';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const postgres = new Client({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASS,
    // Convertir a number con +
    port: +process.env.DATABASE_PORT
});
