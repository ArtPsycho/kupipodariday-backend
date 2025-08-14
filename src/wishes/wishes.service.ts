import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity/wish.entity';
import { User } from '../users/entities/user.entity/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, owner: User): Promise<Wish> {
    return this.wishesRepository.save({
      ...createWishDto,
      owner,
      raised: 0,
      copied: 0,
    });
  }

  async findAll(): Promise<Wish[]> {
    return this.wishesRepository.find({ relations: ['owner'] });
  }

  async findById(id: number): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: { id },
      relations: ['owner', 'offers'],
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    return wish;
  }

  async update(
    id: number,
    updateWishDto: UpdateWishDto,
    userId: number,
  ): Promise<Wish> {
    const wish = await this.findById(id);

    this.validateWishModification(wish, userId);

    return this.wishesRepository.save({
      ...wish,
      ...updateWishDto,
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    const wish = await this.findById(id);
    this.validateWishModification(wish, userId);
    await this.wishesRepository.delete(id);
  }

  private validateWishModification(wish: Wish, userId: number): void {
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя изменять чужие подарки');
    }

    if (wish.offers?.length > 0) {
      throw new ForbiddenException(
        'Нельзя изменять подарки с существующими предложениями',
      );
    }
  }

  async copyWish(id: number, user: User): Promise<Wish> {
    const wish = await this.findById(id);
    const { id: _, copied, raised, offers, ...wishData } = wish;

    await this.wishesRepository.update(id, {
      copied: copied + 1,
    });

    return this.create(wishData, user);
  }

  async findLastWishes(): Promise<Wish[]> {
    return this.wishesRepository.find({
      order: { createdAt: 'DESC' },
      take: 40,
      relations: ['owner'],
    });
  }

  async findTopWishes(): Promise<Wish[]> {
    return this.wishesRepository.find({
      order: { copied: 'DESC' },
      take: 20,
      relations: ['owner'],
    });
  }

  async updateRaisedAmount(wishId: number, amount: number): Promise<void> {
    await this.wishesRepository
      .createQueryBuilder()
      .update(Wish)
      .set({
        raised: () => `raised + ${amount}`,
      })
      .where('id = :id', { id: wishId })
      .execute();
  }
  async getWishesArrayByWishesId(ids: number[]) {
    const wishesArray = await Promise.all(ids.map((id) => this.findById(id)));
    return wishesArray;
  }

  async getWishesList(item): Promise<Wish[]> {
    return this.wishesRepository.findBy(item);
  }
}
