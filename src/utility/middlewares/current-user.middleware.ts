import { Injectable, NestMiddleware } from '@nestjs/common';
import { isArray } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload as JwtPayloadType, verify } from 'jsonwebtoken';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserEntity;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (
      !authHeader ||
      isArray(authHeader) ||
      !authHeader.startsWith('Bearer ')
    ) {
      req.currentUser = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const { id } = <JwtPayloadType>(
        verify(token, process.env.Access_Token_secret_key)
      );

      if (!id) {
        throw new Error('Invalid token payload');
      }
      const currentUser = await this.usersService.findOne(+id);
      req.currentUser = currentUser;
    } catch (error) {
      req.currentUser = null;
      console.error('JWT verification failed:', error);
    }
    next();
  }
}

interface JwtPayload {
  id: string;
}
