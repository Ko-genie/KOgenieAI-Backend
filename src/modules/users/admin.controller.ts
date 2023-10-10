import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UsersService) {}

  @Get('user-list')
  getUserList(@Query() payload: any) {
    return this.userService.userList(payload);
  }

  @Post('status-change-user')
  statusChangeUser(@Body() payload: { user_id: number; status_type: number }) {
    return this.userService.statusChangeUser(payload);
  }
}
