import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpenAiChatCategoryDto } from './dto/create-openai-chat.dto';
import {
  createSlug,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { DefaultPaginationMetaData } from 'src/shared/helpers/coreConstant';
import { UpdateOpenAiChatCategoryDto } from './dto/update-openai-chat.dto';
import { User } from '@prisma/client';
import { StartNewChat } from './dto/start-new-chat.dto';

@Injectable()
export class OpenAiChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createChatCategory(payload: CreateOpenAiChatCategoryDto) {
    try {
      let image_url = null;
      if (payload.file_id) {
        const fileDetails = await this.prisma.myUploads.findFirst({
          where: {
            id: payload.file_id,
          },
        });

        if (!fileDetails) {
          return errorResponse('Invalid image request!');
        }

        image_url = fileDetails.file_path;
      }

      const slug: string = await createSlug(payload.name);

      const openAiChatCategory = await this.prisma.openAiChatCategory.create({
        data: {
          name: payload.name,
          slug: slug,
          description: payload.description,
          role: payload.role,
          human_name: payload.human_name,
          color: payload.color,
          prompt_prefix: 'As a ' + payload.role,
          status: payload.status,
          image_url: image_url,
          help_with: payload.help_with,
        },
      });

      return successResponse(
        'Chat Category is created successfully!',
        openAiChatCategory,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getOpenAiChatCategoryListForAdmin(payload: any) {
    try {
      const paginate = await paginatioOptions(payload);
      const whereCondition = payload.search
        ? {
            name: {
              contains: payload.search,
            },
          }
        : {};
      const list = await this.prisma.openAiChatCategory.findMany({
        where: whereCondition,
        ...paginate,
      });

      const paginationMeta =
        list.length > 0
          ? await paginationMetaData(
              'openAiChatCategory',
              payload,
              whereCondition,
            )
          : DefaultPaginationMetaData;

      const data = {
        list: list,
        meta: paginationMeta,
      };

      return successResponse('Open Ai Chat Category list with paginate', data);
    } catch (error) {
      processException(error);
    }
  }

  async getOpenAiChatCategoryDetails(id: number) {
    try {
      const openAiChatCategoryDetails =
        await this.prisma.openAiChatCategory.findFirst({
          where: {
            id: id,
          },
        });

      if (openAiChatCategoryDetails) {
        return successResponse(
          'OpenAi Chat category details',
          openAiChatCategoryDetails,
        );
      } else {
        return errorResponse('Invalid Request!');
      }
    } catch (error) {
      processException(error);
    }
  }

  async updateChatCategory(payload: UpdateOpenAiChatCategoryDto) {
    try {
      const checkCategory = await this.prisma.openAiChatCategory.findFirst({
        where: {
          id: payload.id,
        },
      });
      if (!checkCategory) {
        return errorResponse('Invalid Request!');
      }

      let image_url = null;
      if (payload.file_id) {
        const fileDetails = await this.prisma.myUploads.findFirst({
          where: {
            id: payload.file_id,
          },
        });

        if (!fileDetails) {
          return errorResponse('Invalid image request!');
        }

        image_url = fileDetails.file_path;
      }

      const slug: string = await createSlug(payload.name);

      const updateChatCategory = await this.prisma.openAiChatCategory.update({
        where: {
          id: checkCategory.id,
        },
        data: {
          name: payload.name,
          slug: slug,
          description: payload.description,
          role: payload.role,
          human_name: payload.human_name,
          color: payload.color,
          prompt_prefix: 'As a ' + payload.role,
          status: payload.status,
          image_url: image_url,
          help_with: payload.help_with,
        },
      });

      return successResponse(
        'Chat Category is created successfully!',
        updateChatCategory,
      );
    } catch (error) {
      processException(error);
    }
  }

  async deleteOpenAiChatCategory(id: number) {
    try {
      const checkCategory = await this.prisma.openAiChatCategory.findFirst({
        where: {
          id: id,
        },
      });
      if (!checkCategory) {
        return errorResponse('Invalid Request!');
      }

      await this.prisma.openAiChatCategory.delete({
        where: {
          id: id,
        },
      });

      return successResponse('OpenAi Chat category is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }

  async startNewChat(user: User, payload: StartNewChat) {
    try {
      const checkCategory = await this.prisma.openAiChatCategory.findFirst({
        where: {
          id: payload.chat_category_id,
        },
      });

      if (!checkCategory) {
        return errorResponse('Invalid Request!');
      }
    } catch (error) {
      processException(error);
    }
  }
}
