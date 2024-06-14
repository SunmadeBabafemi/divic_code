import { Resolver, Query, Mutation, Args, Int, Context, } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UseGuards, Req } from '@nestjs/common';
import { LoginUserInput } from './dto/login-user.input';
import { SetUpBiometricKeyInput } from './dto/setup-biometric-key.input';
import { AuthGuardGQL } from '../common/guards/authGql.guard';
import { BiometricLoginInput } from './dto/biometric-login.input';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) { }

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    const user = await this.userService.create(createUserInput);
    return user
    // return ResponseObject.Ok(user, "User Signed Up Successfully",)
  }

  @Mutation(() => User)
  async userLogin(@Args('userLoginInput') userLoginInput: LoginUserInput) {
    const user = await this.userService.login(userLoginInput);
    return user
    // return ResponseObject.Ok(user, "User Signed Up Successfully",)
  }

  @Mutation(() => User)
  @UseGuards(AuthGuardGQL)
  async setupBiometricKey(
    @Args('setUpBiometricKeyInput') setUpBiometricKeyInput: SetUpBiometricKeyInput,
    @Context() context: any
  ) {
    //retreive user object from authGuard: AuthGuardGQL
    const user = context.user
    return this.userService.setupBiometricLogin(setUpBiometricKeyInput, user);
  }

  @Mutation(() => User)
  async biometricLogin(
    @Args('biometricLoginInput') biometricLoginInput: BiometricLoginInput,
  ) {
    return this.userService.biometricLogin(biometricLoginInput);
  }

}
