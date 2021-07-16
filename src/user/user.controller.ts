import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { JwtAuthenticationGuard } from 'src/auth/guards/jwtAuthentication.guard';
import { UserIsMeGuard } from 'src/auth/guards/userIsMe.guard';
import { storage } from 'src/common/utils';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthenticationGuard, UserIsMeGuard)
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number) {
    return this.userService.deleteUser(id);
  }

  @Post('avatar')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(FileInterceptor('avatar', storage))
  uploadAvatar(@Request() request, @UploadedFile() image): Promise<string> {
    const userId = request.user.id;
    return this.userService.uploadAvatar(userId, image.filename);
  }

  @Get('avatar/:image')
  downloadAvatar(@Param('image') imageName, @Res() res) {
    return res.sendFile(
      join(process.cwd(), `files/uploads/images/user_avatars/${imageName}`),
    );
  }
}
