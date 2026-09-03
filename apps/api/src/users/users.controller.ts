import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get the authenticated user profile',
    description:
      "Includes expiresAt (when the current access token cookie expires) so the frontend can schedule its own silent refresh without hardcoding the backend's token lifespan.",
  })
  @ApiOkResponse({ type: CurrentUserResponseDto })
  me() {
    return this.usersService.me();
  }

  @Patch('me')
  @ApiOperation({ summary: "Update the authenticated user's name/email" })
  updateMe(@Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(dto);
  }
}
