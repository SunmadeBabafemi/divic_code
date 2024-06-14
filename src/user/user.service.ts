import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { JwtHelperService } from './jwtHelper.service';
import { LoginUserInput } from './dto/login-user.input';
import { SetUpBiometricKeyInput } from './dto/setup-biometric-key.input';
import { BiometricLoginInput } from './dto/biometric-login.input';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtHelperService: JwtHelperService
  ) { }

  async create(createUserInput: CreateUserInput) {
    try {
      const existingUser: User = await this.prisma.user.findFirst({
        where: {
          email: createUserInput.email
        }
      })

      if (existingUser) {
        throw new BadRequestException("User With Email Already Exists")
      }

      //HASH USER'S INPUTTED PASSWORD
      const hashedPassword = await this.jwtHelperService.hashPassword(createUserInput.password)

      const user = await this.prisma.user.create({
        data: {
          email: createUserInput.email.toLowerCase(),
          password: hashedPassword,
        }
      })
      if (!user) {
        throw new InternalServerErrorException("Unable To Create User At The Moment")
      }

      // GENERATE ACCESS TOKENS FOR USER AUTHENTICATION ANS SESSION STORE
      const accessToken = await this.jwtHelperService.getNewjwtoken({
        id: String(user.id),
        email: user.email
      })
      const newUser = await this.prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          accessToken: accessToken
        }
      })
      return newUser
    } catch (error) {
      console.log("🚀 ~ UserService ~ create ~ error:", error)
      if (!(error instanceof HttpException)) {
        throw new InternalServerErrorException('An unexpected error occurred while creating the user');
      }
      throw error;

    }
  }

  async login(userLoginInput: LoginUserInput) {
    try {
      const existingUser: User = await this.prisma.user.findFirst({
        where: {
          email: userLoginInput.email.toLowerCase()
        }
      })

      if (!existingUser) {
        throw new BadRequestException("Email Not Found On Server")
      }

      //CHECK IF PASSWORD IS CORRECT
      const isPasswordCorrect = await this.jwtHelperService.comparePassword(userLoginInput.password, existingUser.password)
      if (isPasswordCorrect !== true) {
        throw new BadRequestException('Password Incorrect')
      }
      const accessTokenPayload = {
        id: String(existingUser.id),
        email: existingUser.email
      }

      //UPDATE USER ACCESS TOKENS FOR SUCCESSFUL LOGIN
      const access_token = await this.jwtHelperService.getNewjwtoken(accessTokenPayload)
      const loggedInUser = await this.prisma.user.update({
        where: {
          id: existingUser.id
        },
        data: {
          accessToken: access_token
        }
      })
      return loggedInUser
    } catch (error) {
      console.log("🚀 ~ UserService ~ login ~ error:", error)
      if (!(error instanceof HttpException)) {
        throw new InternalServerErrorException('An unexpected error occurred while creating the user');
      }
      throw error;

    }
  }

  async setupBiometricLogin(setUpBiometricKeyInput: SetUpBiometricKeyInput, user: User) {
    try {
      //CHECK IF USER EXISTS ON DATABASE
      const existingUser: User = await this.prisma.user.findFirst({
        where: {
          id: user.id
        }
      })

      if (!existingUser) {
        throw new BadRequestException("User Not Found On Server")
      }
      if (existingUser.biometricKey === setUpBiometricKeyInput.biometricKey) {
        throw new BadRequestException("User Already Setup Biometric Login On This Device")
      }

      //UPDATE USER BIOMETRIC DATA IF KEY SENT IS NEW
      const biometriUser = await this.prisma.user.update({
        where: {
          id: existingUser.id
        },
        data: {
          biometricKey: setUpBiometricKeyInput.biometricKey
        }
      })
      return biometriUser

    } catch (error) {
      console.log("🚀 ~ UserService ~ setupBiometricLogin ~ error:", error)
      if (!(error instanceof HttpException)) {
        throw new InternalServerErrorException('An unexpected error occurred while creating the user');
      }
      throw error;
    }
  }

  async biometricLogin(biometricLoginInput: BiometricLoginInput) {
    try {

      //CHECK IF USER HAS BIOMETRIC LOGIN SETUP ON THIS DEVICE
      const biometricUser: User = await this.prisma.user.findFirst({
        where: {
          biometricKey: biometricLoginInput.biometricKey
        }
      })

      if (!biometricUser) {
        throw new BadRequestException("No Biometric Login Setup Found On This Device")
      }

      const accessTokenPayload = {
        id: String(biometricUser.id),
        email: biometricUser.email
      }
      const access_token = await this.jwtHelperService.getNewjwtoken(accessTokenPayload)
      //UPDATE USER ACCESS TOKEN FOR SUCCESSFUL LOGIN
      const biometriUser = await this.prisma.user.update({
        where: {
          id: biometricUser.id
        },
        data: {
          accessToken: access_token
        }
      })
      return biometriUser
    } catch (error) {
      console.log("🚀 ~ UserService ~ biometricLogin ~ error:", error)
      if (!(error instanceof HttpException)) {
        throw new InternalServerErrorException('An unexpected error occurred while creating the user');
      }
      throw error;
    }
  }

}
