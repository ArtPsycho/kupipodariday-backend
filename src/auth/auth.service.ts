import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-users.dto';
import { verifyPassword } from './password/verify';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async signup(createUserDto: CreateUserDto) {
    try {
      if (createUserDto.about === '') {
        delete createUserDto.about;
      }
      const user = await this.usersService.create(createUserDto);
      if (!user) {
        throw new HttpException(
          'Не удалось создать пользователя',
          HttpStatus.BAD_REQUEST,
        );
      }
      const payload = { username: user.username, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  async signin(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    // Возвращаем только необходимые данные без password
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
