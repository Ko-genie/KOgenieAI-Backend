import { Injectable } from '@nestjs/common';
import {
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { AddNewCategoryDto } from './dto/add-new-category.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AddNewCustomTemplateDto } from './dto/add-new-custom-template.dto';

@Injectable()
export class TemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async addNewCategory(payload: AddNewCategoryDto) {
    try {
      const checkNameUnique = await this.prisma.templateCategory.findFirst({
        where: {
          name: {
            contains: payload.name,
          },
        },
      });
      if (checkNameUnique) {
        return errorResponse('This category is already has!');
      }
      const data = await this.prisma.templateCategory.create({
        data: {
          ...payload,
        },
      });

      return successResponse('Category is added successfully!', data);
    } catch (error) {
      processException(error);
    }
  }

  async updateCategory(payload: UpdateCategoryDto) {
    try {
      const checkNameUnique = await this.prisma.templateCategory.findFirst({
        where: {
          id: {
            not: payload.id,
          },
          name: {
            contains: payload.name,
          },
        },
      });

      if (checkNameUnique) {
        return errorResponse('This category is already has!');
      }
      const { name, description } = payload;
      const data = await this.prisma.templateCategory.update({
        where: {
          id: payload.id,
        },
        data: {
          name,
          description,
        },
      });

      return successResponse('Category is update successfully!', data);
    } catch (error) {
      processException(error);
    }
  }

  async getListCategory(payload: any) {
    try {
      const paginate = await paginatioOptions(payload);

      const categoryList = await this.prisma.templateCategory.findMany({
        ...paginate,
      });

      const paginationMeta = await paginationMetaData(
        'templateCategory',
        payload,
      );

      const data = {
        list: categoryList,
        meta: paginationMeta,
      };

      return successResponse('Category List data', data);
    } catch (error) {
      processException(error);
    }
  }
  async deleteCategory(id: number) {
    try {
      const checkCategory = await this.prisma.templateCategory.findFirst({
        where: {
          id: id,
        },
      });

      if (checkCategory) {
        await this.prisma.templateCategory.delete({
          where: {
            id: id,
          },
        });

        return successResponse('Category is deleted successfully!');
      } else {
        return errorResponse('Category is not found!');
      }
    } catch (error) {
      processException(error);
    }
  }

  async getCategoryDetails(id: number) {
    try {
      const categoryDetails = await this.prisma.templateCategory.findFirst({
        where: {
          id,
        },
      });
      if (categoryDetails) {
        return successResponse('Category details', categoryDetails);
      } else {
        return errorResponse('Category is not found!');
      }
    } catch (error) {
      processException(error);
    }
  }

  async addNewCustomTemplate(payload: AddNewCustomTemplateDto) {
    try {
      const {
        title,
        description,
        color,
        category_id,
        package_type,
        prompt_input,
        prompt,
        input_groups,
      } = payload;

      const newTemplateData = await this.prisma.template.create({
        data: {
          title,
          description,
          color,
          category_id,
          package_type,
          prompt_input,
          prompt,
        },
      });

      const inputGroupPromises = input_groups.map((inputGroup, key) => {
        return this.prisma.templateField.create({
          data: {
            field_name: inputGroup.name,
            type: inputGroup.type,
            template_id: newTemplateData.id,
            description: inputGroup.description,
          },
        });
      });

      await Promise.all(inputGroupPromises);

      const templateData = await this.prisma.template.findFirst({
        where: {
          id: newTemplateData.id,
        },
        include: {
          TemplateField: true,
        },
      });
      return successResponse('A new template is created!', templateData);
    } catch (error) {
      processException(error);
    }
  }

  async getTemplateList(payload: any) {
    try {
      const paginate = await paginatioOptions(payload);

      const templateList = await this.prisma.template.findMany({
        include: {
          templateCategory: true,
          TemplateField: true,
        },
        ...paginate,
      });

      const paginationMeta = await paginationMetaData('template', payload);

      const data = {
        list: templateList,
        meta: paginationMeta,
      };

      return successResponse('Template List with paginate', data);
    } catch (error) {
      processException(error);
    }
  }
}
