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
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponse } from './dto/user-response';
import { UsersService } from './users.service';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { errorResponse, successResponse } from 'src/shared/helpers/functions';
import { User } from '@prisma/client';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import { ResponseModel } from 'src/shared/models/response.model';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { UpdateUserDto } from './dto/update-user.dto';
import { query } from 'express';

@Controller('user')
export class UserController {
  /** Exposes user CRUD endpoints
   *
   * Instantiate class and UserService dependency
   */
  constructor(private readonly userService: UsersService) {}
  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    let user = req.user;
    if (!user) {
      return errorResponse('Please login inorder to get profile data');
    }
    if (user.role === coreConstant.USER_ROLE_ADMIN) {
      const admin = {
        ...user,
        is_admin: true,
      };
      return successResponse('Admin Response successfully', admin);
    }
    return successResponse('Response successfully', user);
  }

  /** Creates a new user */
  @IsAdmin()
  @Post('create-user')
  create(@Body() payload: CreateUserDto): Promise<UserResponse> {
    return this.userService.create(payload);
  }

  // get all user list
  @IsAdmin()
  @Get('user-list')
  list(@Query() payload: any): Promise<ResponseModel> {
    
    return this.userService.userList(payload);
  }

  @Post('update-profile')
  updateProfile(
    @UserInfo() user: User,
    @Body() payload: UpdateUserDto,
  ): Promise<ResponseModel> {
    return this.userService.updateProfile(user, payload);
  }

  @Post('check-user-name')
  checkUserNameIsUnique(
    @UserInfo() user: User,
    @Body()
    payload: {
      user_name: string;
    },
  ): Promise<ResponseModel> {
    return this.userService.checkUserNameIsUnique(user, payload);
  }

  @Get('change-status')
  changeStatus(@UserInfo() user: User): Promise<ResponseModel> {
    return this.userService.changeStatus(user);
  }
}
