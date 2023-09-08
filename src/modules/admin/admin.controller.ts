import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { UsersService } from '../users/users.service';
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UsersService,
  ) {}
  @IsAdmin()
  @Get('user-list')
  list(@Query() payload: any): Promise<ResponseModel> {
    return this.userService.userList(payload);
  }
}
