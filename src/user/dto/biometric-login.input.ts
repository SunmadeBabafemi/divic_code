import { InputType, Int, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { SetUpBiometricKeyInput } from './setup-biometric-key.input';

@InputType()
export class BiometricLoginInput extends SetUpBiometricKeyInput { }
