import { Module } from '@nestjs/common';
import { AppResolver } from './app.resolver';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { GraphqlModule } from './graphql/graphql.module';
import { GqlHttpExceptionFilter } from './common/filters/gql-http-exception.filter';
import { APP_FILTER } from '@nestjs/core';


@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      context: ({ req, res }) => ({ req, res })
    }),
    UserModule,
    PrismaModule,
    // GraphqlModule
  ],
  controllers: [

  ],

  providers: [
    AppService,
    AppResolver,
    {
      provide: APP_FILTER,
      useClass: GqlHttpExceptionFilter
    }
  ],
})
export class AppModule { }
