import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Account } from 'src/account/account.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne(id);
    if (!user) throw new NotFoundException('User not found!');
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ email });
    if (!user) throw new NotFoundException('User not found!');
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const account = this.accountRepository.create();
      const hashedPassword = await hash(createUserDto.password, 10);
      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
        account,
      });

      await this.usersRepository.save(user);
      delete user.password;

      return user;
    } catch (error) {
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.preload({
      id: +id,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`User not found.`);
    }
    await this.usersRepository.save(user);
    return user;
  }

  async deleteUser(id: number): Promise<number> {
    const removedUser = await this.getUserById(id);
    await this.usersRepository.remove(removedUser);

    return id;
  }

  async uploadAvatar(userId: number, avatar: string): Promise<string> {
    await this.updateUser(userId, { avatar });

    return avatar;
  }
}
