import { Response } from 'express-serve-static-core';
import { HttpStatusCode } from 'axios';
import { DoNotRespondError, NotFoundError } from './types/trainerTypes';

export function processError(e: any, res: Response<any, Record<string, any>, number>) {
    if (e instanceof NotFoundError) {
        res.status(HttpStatusCode.NotFound).send(e.message);
        return;
    }

    if (e instanceof DoNotRespondError) {
        console.log(e);
        return;
    }

    res.status(HttpStatusCode.InternalServerError).send(e.message);
}
