import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me() {
    return this.usersService.me();
  }

  @Patch('me')
  updateMe(@Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(dto);
  }
}
