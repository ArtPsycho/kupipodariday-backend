import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { User } from './entities/user.entity/user.entity';
import { AuthUser } from '../decorators/auth-user.decorator';
import { Wish } from '../wishes/entities/wish.entity/wish.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findMany();
  }

  @Post('find')
  findUserByUsernameOrEmail(@Body('query') query: string) {
    return this.usersService.search(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@AuthUser() user: User): Promise<Omit<User, 'password'>> {
    return this.usersService.findById(user.id);
  }

  @Get(':username')
  async findUserByUsername(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    if (user && user.password) {
      delete user.password;
    }
    return user;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @AuthUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async removeMe(@AuthUser() user: User): Promise<void> {
    return this.usersService.remove(user.id);
  }

  @Get('me/wishes')
  @UseGuards(JwtAuthGuard)
  async findMyWishes(@AuthUser() user: User): Promise<Wish[]> {
    try {
      return await this.usersService.getMyWishes(user.id);
    } catch (error) {
      throw new NotFoundException('Не удалось найти ваши подарки');
    }
  }

  @Get(':username/wishes')
  async findUserWishesByUsername(
    @Param('username') username: string,
  ): Promise<Wish[]> {
    try {
      return await this.usersService.getUserWishesByUsername(username);
    } catch (error) {
      throw new NotFoundException(
        `Не удалось найти подарки пользователя ${username}`,
      );
    }
  }
}
