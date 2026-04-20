import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'expresscart',
      password: process.env.DATABASE_PASSWORD || 'expresscart_secret',
      database: process.env.DATABASE_NAME || 'expresscart',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CartModule,
    CheckoutModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
