import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity/user.entity';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { hashPassword } from '../auth/password/hash';
import { Wish } from '../wishes/entities/wish.entity/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, username, email, ...rest } = createUserDto;
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException(
          'Пользователь с таким именем уже существует',
        );
      }
      if (existingUser.email === email) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
    }
    const hashedPassword = await hashPassword(password);
    try {
      const userToCreate = this.usersRepository.create({
        username,
        email,
        ...rest,
        password: hashedPassword,
      });
      const savedUser = await this.usersRepository.save(userToCreate);
      if (savedUser.password) {
        delete savedUser.password;
      }
      return savedUser;
    } catch (error) {
      throw new ConflictException('Ошибка при создании пользователя', error);
    }
  }

  async findMany(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'username', 'about', 'avatar', 'createdAt'],
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'about', 'avatar', 'email', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async findByUsername(username: string) {
    return this.usersRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password', 'email'],
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'username'],
    });
  }

  async search(query: string): Promise<User[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return this.usersRepository.find({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
      select: ['id', 'username', 'about', 'avatar', 'createdAt'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.usersRepository.save({
      ...user,
      ...updateUserDto,
    });
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Пользователь не найден');
    }
  }

  async getMyWishes(userId: number): Promise<Wish[]> {
    const currentUser = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['wishes'],
    });
    if (!currentUser) {
      throw new NotFoundException('Пользователь не найден');
    }
    return currentUser.wishes;
  }
  async getUserWishesByUsername(username: string): Promise<Wish[]> {
    const user = await this.usersRepository.findOne({
      where: { username: ILike(username) },
      relations: ['wishes'],
    });
    if (!user) {
      throw new NotFoundException('Запрашиваемый пользователь не найден');
    }
    return user.wishes;
  }
}
