import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { jwtConstants } from '../constants/jwt.constant';
import { ExpressRequestExtension } from '../interfaces/express-extension.interface';
import { User } from '@prisma/client';
import { JwtHelperService } from 'src/user/jwtHelper.service';

@Injectable()
export class AuthGuard implements NestMiddleware {
  constructor(
    private jwtHelperService: JwtHelperService,
    private prisma: PrismaService
  ) { }
  async use(req: ExpressRequestExtension, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    let user: User
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring('Bearer '.length);
      if (!token) {
        throw new UnauthorizedException("Unauthorized Access")
      } else {
        const verify = await this.jwtHelperService.verifyJwToken(token)
        if (!verify) {
          throw new UnauthorizedException("Invalid JWT Passed")
        }
        user = await this.prisma.user.findUnique({
          where: {
            id: Number(verify?.id)
          }
        })
        if (!user) {
          throw new UnauthorizedException("Unauthorized Access")
        }
        req['user'] = user;
        req["userId"] = String(user?.id);
        req["token"] = token;
        next()
      }
    } else {
      throw new UnauthorizedException("Unauthorized Access")
    }
  }
}
