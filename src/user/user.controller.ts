//import { UpdateUserSalaryDto } from './dto/update-User-salary.dto';
import { Controller, Get, Post, Body } from '@nestjs/common';
import { Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
import { SkipThrottle } from '@nestjs/throttler';
import { Throttle } from '@nestjs/throttler';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UserBooksDto } from './dto/create-user-books.dto';

@SkipThrottle()
@Controller('Users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.userService.create(createUserDto);
  }

  @SkipThrottle({ default: false })
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Throttle({ short: { ttl: 1000, limit: 1 } })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post('assign-books')
  assignBooksToUser(@Body() UserBooksDto: UserBooksDto){
    return this.userService.asignBooksToUser(UserBooksDto);
  }
}
