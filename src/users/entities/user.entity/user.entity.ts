import {
  IsEmail,
  IsString,
  Length,
  IsUrl,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
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
  @IsNumber()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index()
  @Column({ unique: true, length: 30 })
  @IsString()
  @Length(1, 30)
  username: string;

  @Column({ default: 'Пока ничего не рассказал о себе', length: 200 })
  @IsString()
  @Length(1, 200)
  about: string;

  @Column({ default: 'https://i.pravatar.cc/300' })
  @IsUrl()
  avatar: string;

  @Index()
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  password: string;

  @OneToMany(() => Wish, (wish) => wish.owner)
  wishes: Wish[];

  @OneToMany(() => Offer, (offer) => offer.user)
  offers: Offer[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.owner)
  wishlists: Wishlist[];
}
