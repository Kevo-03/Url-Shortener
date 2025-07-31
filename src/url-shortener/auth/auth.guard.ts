import {
    CanActivate, ExecutionContext, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ENV_VAR } from '../../config/app.config';

const expected = (ENV_VAR.BASIC_AUTH ?? '').trim();

@Injectable()
export class BasicAuthGuard implements CanActivate {

    canActivate(ctx: ExecutionContext) {
        const req = ctx.switchToHttp().getRequest<Request>();
        const header = req.headers.authorization;

        if (!header?.startsWith('Basic ')) {
            throw new UnauthorizedException('Missing Authorization header');
        }

        if (header?.trim() === expected) return true;


        throw new UnauthorizedException({
            statusCode: 401,
            message: 'Invalid basic credentials',
            error: 'Unauthorized',
            headers: { 'WWW-Authenticate': 'Basic realm="ShortURL"' },
        });
    }
}