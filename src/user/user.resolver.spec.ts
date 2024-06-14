import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { LoginUserInput } from './dto/login-user.input';
import { SetUpBiometricKeyInput } from './dto/setup-biometric-key.input';
import { BiometricLoginInput } from './dto/biometric-login.input';
import { JwtHelperService } from './jwtHelper.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './entities/user.entity';
import { InternalServerErrorException } from '@nestjs/common';


describe('UserResolver', () => {
  let resolver: UserResolver;
  let service: UserService;

  const mockUserService = {
    create: jest.fn(),
    login: jest.fn(),
    setupBiometricLogin: jest.fn(),
    biometricLogin: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockJwtHelperService = {
    // Mock methods as needed for JwtHelperService
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
    getNewjwtoken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: JwtHelperService,
          useValue: mockJwtHelperService,
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserInput: CreateUserInput = { email: 'test@example.com', password: 'password123' };
      const result = { id: 1, email: 'test@example.com', accessToken: "accessToken", createdAt: new Date };

      mockUserService.create.mockResolvedValue(result);

      expect(await resolver.createUser(createUserInput)).toBe(result);

      expect(service.create).toHaveBeenCalledWith(createUserInput);

    });
  });

  describe('userLogin', () => {
    it('should login a user', async () => {
      const loginUserInput: LoginUserInput = { email: 'test@example.com', password: 'password123' };
      const result = { id: 1, email: 'test@example.com' };

      mockUserService.login.mockResolvedValue(result);

      expect(await resolver.userLogin(loginUserInput)).toBe(result);
      expect(service.login).toHaveBeenCalledWith(loginUserInput);
    });
  });

  describe('setupBiometricKey', () => {
    it('should setup biometric key for a user', async () => {
      const setUpBiometricKeyInput: SetUpBiometricKeyInput = { biometricKey: 'biometric-key' };
      const result = { id: 1, email: 'test@example.com', biometricKey: 'biometric-key' };

      const context = { user: { id: 1, email: 'test@example.com' } };
      mockUserService.setupBiometricLogin.mockResolvedValue(result);

      expect(await resolver.setupBiometricKey(setUpBiometricKeyInput, context)).toBe(result);
      expect(service.setupBiometricLogin).toHaveBeenCalledWith(setUpBiometricKeyInput, context.user);
    });
  });

  describe('biometricLogin', () => {
    it('should login a user using biometric key', async () => {
      const biometricLoginInput: BiometricLoginInput = { biometricKey: 'biometric-key' };
      const result = { id: 1, email: 'test@example.com', biometricKey: 'biometric-key' };

      mockUserService.biometricLogin.mockResolvedValue(result);

      expect(await resolver.biometricLogin(biometricLoginInput)).toBe(result);
      expect(service.biometricLogin).toHaveBeenCalledWith(biometricLoginInput);
    });
  });
});