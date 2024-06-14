import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Next,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../common/constants/jwt.constant';
import { configConstant } from '../common/constants/config.constant';
import { ResponseObject } from '../common/helpers/response';
import * as  bcrypt from "bcrypt"
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class JwtHelperService {
  constructor(
    private jwTokenService: JwtService,
    private configService: ConfigService,
  ) { }
  async hashPassword(password: string) {
    try {

      let hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8))
      return hashedPassword;
    } catch (error) {
      console.log("🚀 ~ JwtHelperService ~ hashPassword ~ error:", error)
      throw new ForbiddenException(
        ResponseObject.BadRequest(error.name, error.message, error.status),
      );
    }
  }


  async comparePassword(input_password: string, stored_password: string) {
    try {
      const isCorrect = bcrypt.compareSync(input_password, stored_password)
      return isCorrect;
    } catch (error) {
      throw new ForbiddenException(
        ResponseObject.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async getNewjwtoken(payload: {
    id: string,
    email?: string,
    bio_key?: string
  }) {
    try {
      const newToken = this.jwTokenService.sign(payload, {
        secret: await this.configService.get(jwtConstants.access_secret),
        expiresIn: await this.configService.get(jwtConstants.access_time),
      })

      return newToken

    } catch (error) {
      console.log("🚀 ~ JwtHelperService ~ error:", error)
      throw new ForbiddenException(
        ResponseObject.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async verifyJwToken(token: string, secret: string = jwtConstants.access_secret) {
    try {
      const verified: any = this.jwTokenService.verifyAsync(token, {
        secret: await this.configService.get(secret)
      })

      if (!verified) {
        throw new UnauthorizedException(
          ResponseObject.BadRequest(
            "Invalid JWT",
            "Invalid JWT Passed",
            "400"
          ),
        );
      }
      return verified

    } catch (error) {
      throw new ForbiddenException(
        ResponseObject.BadRequest(error.name, error.message, error.status),
      );
    }
  }

}
