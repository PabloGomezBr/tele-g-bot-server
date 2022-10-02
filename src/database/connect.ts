import { Client } from 'pg';

const postgres = new Client({
    user: 'postgres',
    host: 'containers-us-west-49.railway.app',
    database: 'railway',
    password: 'UIlWtTHOGSR48Q7WbWKL',
    port: 7218
});

export function connectToPostgres() {
    try {
        postgres.connect();
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Error connecting to database: ', error);
    }
}

export default postgres;
