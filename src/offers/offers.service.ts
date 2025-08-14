import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { WishesService } from '../wishes/wishes.service';
import { Offer } from './entities/offer.entity/offer.entity';
import { User } from '../users/entities/user.entity/user.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private wishesService: WishesService,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User): Promise<Offer> {
    const wish = await this.wishesService.findById(createOfferDto.itemId);
    const offer = this.offersRepository.create({
      ...createOfferDto,
      user,
      item: wish,
    });

    await this.wishesService.updateRaisedAmount(wish.id, createOfferDto.amount);

    return this.offersRepository.save(offer);
  }

  async findOne(id: number): Promise<Offer> {
    return this.offersRepository.findOne({
      where: { id },
      relations: ['user', 'item', 'item.owner'],
    });
  }

  async getWishById(id: number) {
    return this.wishesService.findById(id);
  }
}
