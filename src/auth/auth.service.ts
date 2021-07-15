import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { TokenPayload } from './interfaces/tokenPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public async getAuthenticatedUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUserByEmail(email);
      const isPasswordMatching = await compare(password, user.password);
      if (!isPasswordMatching) {
        throw new HttpException(
          'Wrong credentials provided!',
          HttpStatus.BAD_REQUEST,
        );
      }
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException(
        'Something went wrong!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public getCookieWithJwtToken(userId: number, email: string) {
    const payload: TokenPayload = { userId, email };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRATION_TIME}`;
  }
}
