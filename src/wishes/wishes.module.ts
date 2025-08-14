import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishesController } from './wishes.controller';
import { WishesService } from './wishes.service';
import { Wish } from './entities/wish.entity/wish.entity';
import { User } from '../users/entities/user.entity/user.entity';
import { Offer } from '../offers/entities/offer.entity/offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wish, User, Offer])],
  controllers: [WishesController],
  providers: [WishesService],
  exports: [WishesService],
})
export class WishesModule {}
