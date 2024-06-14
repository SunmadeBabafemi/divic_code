import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtHelperService } from './jwtHelper.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      publicKey: 'PUBLIC_KEY',
      privateKey: 'PRIVATE_KEY',
    }),
    ConfigModule
  ],
  providers: [
    UserResolver,
    UserService,
    PrismaService,
    JwtHelperService,
    JwtService,
    ConfigService
  ],
  exports: [
    UserService,
    PrismaService,
    JwtHelperService,
    JwtService,
    ConfigService,
    UserResolver
  ]
})
export class UserModule { }