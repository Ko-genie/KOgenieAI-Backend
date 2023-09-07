import { Injectable, Request } from '@nestjs/common';
import { User } from '@prisma/client';
import {
  createUniqueCode,
  errorResponse,
  generateMailKey,
  hashedPassword,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponse } from './dto/user-response';

import { ForgotPassMailNotification } from 'src/notifications/user/forgot-pass-mail-notification';
import { PrismaService } from '../prisma/prisma.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import { UserVerificationCodeService } from '../verification_code/user-verify-code.service';
import { NotificationService } from 'src/shared/notification/notification.service';
import { SignupVerificationMailNotification } from 'src/notifications/user/signup-verification-mail-notification';
import { ResponseModel } from 'src/shared/models/response.model';
import { use } from 'passport';
import { UpdateUserDto } from './dto/update-user.dto';

// export type User = any;
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userCodeService: UserVerificationCodeService,
    private readonly notificationService: NotificationService,
  ) {}

  //   private readonly users = [
  //     {
  //       userId: 1,
  //       email: 'john',
  //       password: 'changeme',
  //     },
  //     {
  //       userId: 2,
  //       email: 'maria',
  //       password: 'guess',
  //     },
  //   ];

  //     async findOne(email: string): Promise<User | undefined> {
  //         console.log(email);
  //     return this.users.find((user) => user.email === email);
  //   }
  /** Finds user by email and returns the user with password.
   * Used mainly in login to compare if the inputted password matches
   * the hashed one.
   */

  // unique check email and nick name
  async checkEmailNickName(email: string, nickName: string) {
    const checkUniqueEmail = await this.prisma.user.findUnique({
      where: { email: email },
    });
    if (checkUniqueEmail) {
      return errorResponse('Email already exists', []);
    }
    const checkUniqueNickName = await this.prisma.user.findUnique({
      where: { user_name: nickName },
    });
    if (checkUniqueNickName) {
      return errorResponse('Nickname already exists', []);
    }
    return successResponse('success', []);
  }

  /** Creates a new user */
  async create(payload: CreateUserDto): Promise<any> {
    try {
      const checkUniqueEmail = await this.checkEmailNickName(
        payload.email,
        payload.user_name,
      );
      if (checkUniqueEmail.success == false) {
        return checkUniqueEmail;
      }
      const hashPassword = await hashedPassword(coreConstant.COMMON_PASSWORD);
      const lowerCaseEmail = payload.email.toLowerCase();
      const data = {
        ...payload,
        email: lowerCaseEmail,
        password: hashPassword,
      };
      const user = await this.createNewUser(data);
      if (user.success == true) {
        return successResponse('New user created successful', user.data);
      } else {
        return user;
      }
    } catch (err) {
      console.log(err);
    }
    return errorResponse('Something went wrong', []);
  }

  // create new user process
  async createNewUser(payload: any) {
    try {
      const user = await this.prisma.user.create({
        data: {
          ...payload,
          unique_code: createUniqueCode(),
        },
      });
      if (user) {
        const mailKey = generateMailKey();
        const codeData = {
          user_id: user.id,
          code: mailKey,
          type: coreConstant.VERIFICATION_TYPE_EMAIL,
        };
        await this.userCodeService.createUserCode(codeData);

        const mailData = {
          verification_code: mailKey,
        };
        await this.userCodeService.createUserCode(codeData);
        this.notificationService.send(
          new SignupVerificationMailNotification(mailData),
          user,
        );
        return successResponse('New user created successfully', user);
      }
    } catch (err) {
      console.log(err);
    }
    return errorResponse('Something went wrong', []);
  }

  // get user by email
  async findByEmail(email: string): Promise<User> {
    const lowerCaseEmail = email.toLowerCase();

    return this.prisma.user.findUnique({ where: { email: lowerCaseEmail } });
  }

  // get user by id
  async findById(id: number): Promise<User> {
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  // get user list
  async userList() {
    return this.prisma.user.findMany();
  }

  // send forgot password email
  async sendForgotPasswordEmailProcess(email: string) {
    try {
      const user = await this.findByEmail(email);
      if (user) {
        const mailKey = generateMailKey();
        const codeData = {
          user_id: user.id,
          code: mailKey,
          type: coreConstant.VERIFICATION_TYPE_EMAIL,
        };
        const mailData = {
          verification_code: mailKey,
        };
        await this.userCodeService.createUserCode(codeData);
        this.notificationService.send(
          new ForgotPassMailNotification(mailData),
          user,
        );
      } else {
        return successResponse('User not found', []);
      }
    } catch (err) {
      console.log(err);
    }
    return errorResponse('Something went wrong');
  }

  async updateProfile(
    user: User,
    payload: UpdateUserDto,
  ): Promise<ResponseModel> {
    try {
      const exist = await this.prisma.user.findFirst({
        where: {
          email: {
            not: {
              equals: user.email,
            },
          },
          user_name: payload.user_name,
        },
      });
      if (exist) {
        return errorResponse('Username has been already taken!');
      }
      const updatedUser = await this.prisma.user.update({
        where: {
          email: user.email,
        },
        data: {
          // first_name: payload.first_name,
          // last_name: payload.last_name,
          // phone: payload.phone,
          // country: payload.country,
          // birth_date: new Date(payload.birth_date),
          // gender: Number(payload.gender),
          ...payload,
          birth_date: new Date(payload.birth_date),
          gender: Number(payload.gender),
        },
      });

      return successResponse('Profile is updated successfully!', updatedUser);
    } catch (error) {
      processException(error);
    }
  }

  async checkUserNameIsUnique(
    user: User,
    payload: {
      user_name: string;
    },
  ) {
    try {
      const checkUserNameExists = await this.prisma.user.findFirst({
        where: {
          email: {
            not: {
              equals: user.email,
            },
          },
          user_name: payload.user_name,
        },
      });

      if (checkUserNameExists) {
        return errorResponse('This name has been already taken!');
      } else {
        return successResponse('This name is unique!');
      }
    } catch (error) {
      processException(error);
    }
  }
}
