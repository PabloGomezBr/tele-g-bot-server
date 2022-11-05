/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import logger from 'node-color-log';

import { postgres } from '../database/connect';

export async function getMessage(req: Request, res: Response, next: NextFunction) {
    try {
        const response = await postgres.query('SELECT message FROM messages WHERE id = 1');
        res.status(200).send(`<h1>${response.rows[0].message}</h1>`);
        // next(response.rows[0].message);
    } catch (error) {
        logger.log(error);
        res.status(500).send('Something went wrong...');
        // next('ERROR');
    }

    // const response = postgres.query(
    //     'SELECT message FROM messages WHERE id = 1',
    //     (err: any, { rows } : { rows: any}) => {
    //         if (err) {
    //             postgres.end();
    //             logger.log(err);
    //             return err.toString();
    //         }
    //         postgres.end();
    //         logger.log(rows[0].message);
    //         return rows[0].message;
    //     }
    // );
    // console.log(response);
    // next(response);
}
