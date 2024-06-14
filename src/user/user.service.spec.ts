import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtHelperService } from './jwtHelper.service';
import { CreateUserInput } from './dto/create-user.input';
import { LoginUserInput } from './dto/login-user.input';
import { SetUpBiometricKeyInput } from './dto/setup-biometric-key.input';
import { BiometricLoginInput } from './dto/biometric-login.input';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;
  let jwtHelperService: JwtHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtHelperService,
          useValue: {
            hashPassword: jest.fn(),
            getNewjwtoken: jest.fn(),
            comparePassword: jest.fn(),
            verifyJwToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtHelperService = module.get<JwtHelperService>(JwtHelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw an error if the user already exists', async () => {
      const createUserInput: CreateUserInput = { email: 'test@test.com', password: 'password' };
      prisma.user.findFirst = jest.fn().mockResolvedValueOnce({ email: 'test@test.com' });

      await expect(service.create(createUserInput)).rejects.toThrow(BadRequestException);
    });

    it('should create a new user and return the user with a token', async () => {
      const createUserInput: CreateUserInput = { email: 'test@test.com', password: 'password' };
      prisma.user.findFirst = jest.fn().mockResolvedValueOnce(null);
      jwtHelperService.hashPassword = jest.fn().mockResolvedValueOnce('hashedPassword');
      prisma.user.create = jest.fn().mockResolvedValueOnce({ id: 1, email: 'test@test.com', password: 'hashedPassword' });
      jwtHelperService.getNewjwtoken = jest.fn().mockResolvedValueOnce('newToken');
      prisma.user.update = jest.fn().mockResolvedValueOnce({ id: 1, email: 'test@test.com', accessToken: 'newToken' });

      const result = await service.create(createUserInput);

      expect(result).toEqual({ id: 1, email: 'test@test.com', accessToken: 'newToken' });
    });

    it('should handle unexpected errors', async () => {
      const createUserInput: CreateUserInput = { email: 'test@test.com', password: 'password' };
      prisma.user.findFirst = jest.fn().mockRejectedValueOnce(new Error());

      await expect(service.create(createUserInput)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('login', () => {
    it('should throw an error if the email is not found', async () => {
      const loginUserInput: LoginUserInput = { email: 'test@test.com', password: 'password' };
      prisma.user.findFirst = jest.fn().mockResolvedValueOnce(null);

      await expect(service.login(loginUserInput)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if the password is incorrect', async () => {
      const loginUserInput: LoginUserInput = { email: 'test@test.com', password: 'password' };
      prisma.user.findFirst = jest.fn().mockResolvedValueOnce({ email: 'test@test.com', password: 'hashedPassword' });
      jwtHelperService.comparePassword = jest.fn().mockResolvedValueOnce(false);

      await expect(service.login(loginUserInput)).rejects.toThrow(BadRequestException);
    });

    it('should return the logged in user with a token', async () => {
      const loginUserInput: LoginUserInput = { email: 'test@test.com', password: 'password' };
      prisma.user.findFirst = jest.fn().mockResolvedValueOnce({ id: 1, email: 'test@test.com', password: 'hashedPassword' });
      jwtHelperService.comparePassword = jest.fn().mockResolvedValueOnce(true);
      jwtHelperService.getNewjwtoken = jest.fn().mockResolvedValueOnce('newToken');
      prisma.user.update = jest.fn().mockResolvedValueOnce({ id: 1, email: 'test@test.com', accessToken: 'newToken' });

      const result = await service.login(loginUserInput);

      expect(result).toEqual({ id: 1, email: 'test@test.com', accessToken: 'newToken' });
    });

    it('should handle unexpected errors', async () => {
      const loginUserInput: LoginUserInput = { email: 'test@test.com', password: 'password' };
      prisma.user.findFirst = jest.fn().mockRejectedValueOnce(new Error());

      await expect(service.login(loginUserInput)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('setupBiometricLogin', () => {
    it('should throw an error if the user is not found', async () => {
      const setUpBiometricKeyInput: SetUpBiometricKeyInput = { biometricKey: 'biometricKey' };
      prisma.user.findFirst = jest.fn().mockResolvedValueOnce(null);

      await expect(service.setupBiometricLogin(setUpBiometricKeyInput, { id: 1 } as User)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if the user already set up biometric login on this device', async () => {
      const setUpBiometricKeyInput: SetUpBiometricKeyInput = { biometricKey: 'biometricKey' };
      prisma.user.findFirst = jest.fn().mockResolvedValueOnce({ id: 1, biometricKey: 'biometricKey' });

      await expect(service.setupBiometricLogin(setUpBiometricKeyInput, { id: 1 } as User)).rejects.toThrow(BadRequestException);
    });

    it('should return the updated user with new biometric key', async () => {
      const setUpBiometricKeyInput: SetUpBiometricKeyInput = { biometricKey: 'newBiometricKey' };
      prisma.user.findFirst = jest.fn().mockResolvedValueOnce({ id: 1, biometricKey: 'oldBiometricKey' });
      prisma.user.update = jest.fn().mockResolvedValueOnce({ id: 1, biometricKey: 'newBiometricKey' });

      const result = await service.setupBiometricLogin(setUpBiometricKeyInput, { id: 1 } as User);

      expect(result).toEqual({ id: 1, biometricKey: 'newBiometricKey' });
    });

    it('should handle unexpected errors', async () => {
      const setUpBiometricKeyInput: SetUpBiometricKeyInput = { biometricKey: 'biometricKey' };
      prisma.user.findFirst = jest.fn().mockRejectedValueOnce(new Error());

      await expect(service.setupBiometricLogin(setUpBiometricKeyInput, { id: 1 } as User)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('biometricLogin', () => {
    it('should throw an error if no biometric login setup is found on this device', async () => {
      const biometricLoginInput: BiometricLoginInput = { biometricKey: 'biometricKey' };
      prisma.user.findFirst = jest.fn().mockResolvedValueOnce(null);

      await expect(service.biometricLogin(biometricLoginInput)).rejects.toThrow(BadRequestException);
    });

    it('should return the user with a new access token', async () => {
      const biometricLoginInput: BiometricLoginInput = { biometricKey: 'biometricKey' };
      prisma.user.findFirst = jest.fn().mockResolvedValueOnce({ id: 1, email: 'test@test.com', biometricKey: 'biometricKey' });
      jwtHelperService.getNewjwtoken = jest.fn().mockResolvedValueOnce('newToken');
      prisma.user.update = jest.fn().mockResolvedValueOnce({ id: 1, email: 'test@test.com', accessToken: 'newToken' });

      const result = await service.biometricLogin(biometricLoginInput);

      expect(result).toEqual({ id: 1, email: 'test@test.com', accessToken: 'newToken' });
    });

    it('should handle unexpected errors', async () => {
      const biometricLoginInput: BiometricLoginInput = { biometricKey: 'biometricKey' };
      prisma.user.findFirst = jest.fn().mockRejectedValueOnce(new Error());

      await expect(service.biometricLogin(biometricLoginInput)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
