import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtHelperService } from 'src/user/jwtHelper.service';
@Injectable()
export class AuthGuardGQL implements CanActivate {
  constructor(
    private jwtHelperService: JwtHelperService,
    private prisma: PrismaService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    const req = ctx.req;
    let user: User

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header found');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No Authorization Token Found');
    }

    try {
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
      req["token"] = token;;
      ctx.user = user
      return true;
    } catch (error) {
      throw new ForbiddenException('Unauthorized access');
    }
  }
}