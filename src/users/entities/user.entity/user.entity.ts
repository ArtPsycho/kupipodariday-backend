import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Wish } from '../../../wishes/entities/wish.entity/wish.entity';
import { Offer } from '../../../offers/entities/offer.entity/offer.entity';
import { Wishlist } from '../../../wishlists/entities/wishlist.entity/wishlist.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index()
  @Column({ unique: true, length: 30 })
  username: string;

  @Column({ default: 'Пока ничего не рассказал о себе', length: 200 })
  about: string;

  @Column({ default: 'https://i.pravatar.cc/300' })
  avatar: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Wish, (wish) => wish.owner)
  wishes: Wish[];

  @OneToMany(() => Offer, (offer) => offer.user)
  offers: Offer[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.owner)
  wishlists: Wishlist[];
}
