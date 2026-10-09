import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedChatRequest extends Request {
  chatUserId?: string;
}

@Injectable()
export class ChatAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      throw new ServiceUnavailableException('Chat authentication is not configured');
    }

    const request = context.switchToHttp().getRequest<AuthenticatedChatRequest>();
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : '';

    if (!token) throw new UnauthorizedException();

    try {
      const payload = jwt.verify(token, secret, { algorithms: ['HS256'] }) as JwtPayload;
      const userId = payload.user_id ?? payload.id;
      if (userId === undefined || userId === null || userId === '' || !Number.isSafeInteger(Number(userId)) || Number(userId) < 1) {
        throw new UnauthorizedException();
      }
      request.chatUserId = String(userId);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
