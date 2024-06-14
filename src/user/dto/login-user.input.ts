import { InputType, Int, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { CreateUserInput } from './create-user.input';

@InputType()
export class LoginUserInput extends CreateUserInput {
}
