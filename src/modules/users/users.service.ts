import { Injectable, Request } from '@nestjs/common';
import {
  addPhotoPrefix,
  createUniqueCode,
  errorResponse,
  generateMailKey,
  hashedPassword,
  paginatioOptions,
  paginationMetaData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponse } from './dto/user-response';
import { User } from '@prisma/client';

import { ForgotPassMailNotification } from 'src/notifications/user/forgot-pass-mail-notification';
import { PrismaService } from '../prisma/prisma.service';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import { UserVerificationCodeService } from '../verification_code/user-verify-code.service';
import { NotificationService } from 'src/shared/notification/notification.service';
import { SignupVerificationMailNotification } from 'src/notifications/user/signup-verification-mail-notification';
import { ResponseModel } from 'src/shared/models/response.model';
import { use } from 'passport';
import { UpdateUserDto } from './dto/update-user.dto';
import { isNumber } from 'class-validator';
import { User as UserEntity } from './entities/user.entity';
import { randomUUID } from 'crypto';
import { OpenAi } from '../openai/openai.service';

// export type User = any;
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userCodeService: UserVerificationCodeService,
    private readonly notificationService: NotificationService,
  ) {}
  openaiService = new OpenAi();
  async getProfile(user: UserEntity): Promise<ResponseModel> {
    if (!user) {
      return errorResponse('Please login inorder to get profile data');
    }
    user.photo = addPhotoPrefix(user.photo);

    if (user.role === coreConstant.USER_ROLE_ADMIN) {
      const admin = {
        ...user,
        is_admin: true,
      };
      return successResponse('Admin Response successfully', admin);
    }
    return successResponse('Response successfully', user);
  }
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
  async createNewUser(payload: any, sendMail = true) {
    try {
      const user = await this.prisma.user.create({
        data: {
          ...payload,
          unique_code: createUniqueCode(),
        },
      });
      if (user && sendMail) {
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
      return successResponse('New user created successfully', user);
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
  async userList(payload: any) {
    try {
      const paginate = await paginatioOptions(payload);
      console.log(paginate, 'paginate');
      const userList = await this.prisma.user.findMany({
        ...paginate,
      });

      const userListWithoutPassword = userList.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      const paginationMeta = await paginationMetaData('user', payload);

      const data = {
        list: userListWithoutPassword,
        meta: paginationMeta,
      };
      return successResponse('User List', data);
    } catch (error) {
      processException(error);
    }
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

  async changeStatus(payload: { user_id: number }) {
    try {
      if (!payload.user_id) {
        return errorResponse('User Id field is required!');
      }

      const user_id = Number(payload.user_id);
      const userDetails = await this.prisma.user.findFirst({
        where: {
          id: user_id,
        },
      });
      if (userDetails) {
        const status =
          coreConstant.STATUS_ACTIVE == userDetails.status
            ? coreConstant.STATUS_INACTIVE
            : coreConstant.STATUS_ACTIVE;

        const updateUserDetails = await this.prisma.user.update({
          where: {
            id: Number(payload.user_id),
          },
          data: {
            status: status,
          },
        });
        delete updateUserDetails.password;
        return successResponse(
          'Status is updated successfully!',
          updateUserDetails,
        );
      } else {
        return errorResponse('User is not found!');
      }
    } catch (error) {
      processException(error);
    }
  }

  async userListByCountryWise() {
    try {
      const userList = await this.prisma.user.groupBy({
        by: ['country'],
        _count: true,
      });

      console.log(userList);

      return successResponse('Country wise user list', userList);
    } catch (error) {
      processException(error);
    }
  }

  async userProfileDetails(payload: { user_id: number }) {
    try {
      if (!payload.user_id) {
        return errorResponse('User Id field is required!');
      }

      const user_id = Number(payload.user_id);
      const userDetails = await this.prisma.user.findFirst({
        where: {
          id: user_id,
        },
      });

      if (userDetails) {
        delete userDetails.password;

        return successResponse('User Details', userDetails);
      } else {
        return errorResponse('User is not found!');
      }
    } catch (error) {
      processException(error);
    }
  }
  async updateEmail(
    user: User,
    payload: {
      email: string;
    },
  ) {
    try {
      if (!payload.email) {
        return errorResponse('Email field is required!');
      }

      const checkEmailExists = await this.prisma.user.findFirst({
        where: {
          email: {
            not: {
              equals: user.email,
            },
            equals: payload.email,
          },
        },
      });

      if (checkEmailExists) {
        return errorResponse('This email has been already taken!');
      } else {
        const userDetails = await this.prisma.user.update({
          where: {
            email: user.email,
          },
          data: {
            email: payload.email,
          },
        });
        delete userDetails.password;

        return successResponse('Email is updated successfully!', userDetails);
      }
    } catch (error) {
      processException(error);
    }
  }

  async userRegistrationBySocialMedia(payload: any) {
    try {
      const userDetails = await this.prisma.user.findFirst({
        where: {
          email: payload.email,
        },
      });

      if (userDetails) {
        return successResponse('User is already registered!', userDetails);
      } else {
        const lowerCaseEmail = payload.email.toLocaleLowerCase();
        const hashPassword = await hashedPassword(randomUUID());

        const userRegistrationData: any = {
          unique_code: createUniqueCode(),
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: lowerCaseEmail,
          password: hashPassword,
          email_verified: coreConstant.IS_VERIFIED,
          provider: payload.provider,
          provider_id: payload.providerId,
        };

        const user = await this.prisma.user.create({
          data: {
            ...userRegistrationData,
          },
        });
        return successResponse('New user is registered successfully!', user);
      }
    } catch (error) {
      processException(error);
    }
  }
  async testTextGen(payload: { text: string }): Promise<ResponseModel> {
    try {
      await this.openaiService.init();
      const response = await this.openaiService.textCompletion(
        payload.text,
        1,
        '',
      );
      if (!response) {
        return errorResponse('Something went wrong!');
      }
      return successResponse('Text is generated successfully!', response);
    } catch (error) {
      processException(error);
    }
  }

  async getUserDashboardData(user: User) {
    try {
      const data = {};
      const userWordImageDetail =
        await this.prisma.userPurchasedPackage.aggregate({
          _sum: {
            total_words: true,
            total_images: true,
            used_words: true,
            used_images: true,
          },
          where: {
            user_id: user.id,
          },
        });
      data['word_left'] =
        Number(userWordImageDetail._sum.total_words) -
        Number(userWordImageDetail._sum.used_words);

      data['image_left'] =
        Number(userWordImageDetail._sum.total_images) -
        Number(userWordImageDetail._sum.used_images);

      data['latest_document_list'] = await this.prisma.myDocuments.findMany({
        where: {
          user_id: user.id,
        },
        take: 5,
      });
      return successResponse('User dashboard api data!', data);
    } catch (error) {
      processException(error);
    }
  }
}
