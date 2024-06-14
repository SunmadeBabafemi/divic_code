import { InputType, Int, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateUserInput {

  @Field({ nullable: false })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field({ nullable: false })
  @IsNotEmpty()
  password: string;
}
