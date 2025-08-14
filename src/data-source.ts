import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './users/entities/user.entity/user.entity';
import { Wish } from './wishes/entities/wish.entity/wish.entity';
import { Wishlist } from './wishlists/entities/wishlist.entity/wishlist.entity';
import { Offer } from './offers/entities/offer.entity/offer.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  username: process.env.POSTGRES_USER || 'student',
  password: process.env.POSTGRES_PASSWORD || 'student',
  database: process.env.POSTGRES_DB || 'kupipodariday',
  entities: [User, Wish, Wishlist, Offer],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
