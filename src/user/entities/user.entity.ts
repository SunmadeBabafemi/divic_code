import { ObjectType, Field, Int, DateScalarMode } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(type => Int)
  id: number;

  @Field({ nullable: false })
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  biometricKey?: string;

  @Field({ nullable: true })
  accessToken?: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
