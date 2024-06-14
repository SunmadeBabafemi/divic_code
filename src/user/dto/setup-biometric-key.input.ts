import { InputType, Int, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class SetUpBiometricKeyInput {
  @Field({ nullable: false })
  @IsNotEmpty()
  biometricKey: string;
}
