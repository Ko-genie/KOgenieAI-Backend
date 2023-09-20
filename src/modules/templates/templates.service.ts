import { Injectable } from '@nestjs/common';
import {
  checkValidationForContentGenerateUseTemplate,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  setDynamicValueInPrompt,
  successResponse,
} from 'src/shared/helpers/functions';
import { AddNewCategoryDto } from './dto/add-new-category.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AddNewTemplateDto } from './dto/add-new-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { async } from 'rxjs';
import { GenerateOpenAiContentDto } from './dto/generate-content-open-ai.dto';
import { ResponseModel } from 'src/shared/models/response.model';
import { Template } from '@prisma/client';
import { OpenAi } from '../openai/openai.service';

@Injectable()
export class TemplateService {
  constructor(private readonly prisma: PrismaService) {}
  openaiService = new OpenAi();

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

  async addNewCustomTemplate(payload: AddNewTemplateDto) {
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
      const checkCategoryId = await this.prisma.templateCategory.findFirst({
        where: {
          id: category_id,
        },
      });

      if (!checkCategoryId) {
        return errorResponse('Invalid Category Id!');
      }

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
            input_field_name: inputGroup.input_field_name,
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

  async getTemplateDetails(id: number) {
    try {
      const templateDetails = await this.prisma.template.findFirst({
        where: {
          id: id,
        },
        include: {
          TemplateField: true,
        },
      });

      if (templateDetails) {
        return successResponse('Template details', templateDetails);
      } else {
        return errorResponse('Invalid request!');
      }
    } catch (error) {
      processException(error);
    }
  }

  async updateTemplate(payload: UpdateTemplateDto) {
    return this.prisma.$transaction(async (prisma) => {
      try {
        const templateDetails = await prisma.template.findFirst({
          where: {
            id: payload.id,
          },
        });

        if (!templateDetails) {
          return errorResponse('Invalid request!');
        }
        const {
          id,
          title,
          description,
          color,
          category_id,
          package_type,
          prompt_input,
          prompt,
          input_groups,
        } = payload;

        const checkCategoryId = await this.prisma.templateCategory.findFirst({
          where: {
            id: category_id,
          },
        });

        if (!checkCategoryId) {
          return errorResponse('Invalid Category Id!');
        }
        const updateTemplateData = await prisma.template.update({
          where: {
            id: templateDetails.id,
          },
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

        const existingFieldsMap = await prisma.templateField.findMany({
          where: {
            template_id: updateTemplateData.id,
          },
        });

        for (let i = 0; i < input_groups.length; i++) {
          const inputGroup = input_groups[i];
          const { type, name, description } = inputGroup;
          const existingTemplateFieldData = existingFieldsMap.find(
            (object) => object.field_name === name,
          );

          if (existingTemplateFieldData) {
            const existingTemplateFieldIndex = existingFieldsMap.findIndex(
              (object) => object.field_name === name,
            );
            await prisma.templateField.update({
              where: {
                id: existingTemplateFieldData.id,
              },
              data: {
                type: type,
                description: description,
              },
            });

            existingFieldsMap.splice(existingTemplateFieldIndex, 1);
          } else {
            await prisma.templateField.create({
              data: {
                field_name: inputGroup.name,
                input_field_name: inputGroup.input_field_name,
                type: inputGroup.type,
                template_id: updateTemplateData.id,
                description: inputGroup.description,
              },
            });
          }
        }

        if (existingFieldsMap.length > 0) {
          for (let i = 0; i < existingFieldsMap.length; i++) {
            const existingFieldsdataToDelete = existingFieldsMap[i];
            await prisma.templateField.delete({
              where: {
                id: existingFieldsdataToDelete.id,
              },
            });
          }
        }
        const templateData = await prisma.template.findFirst({
          where: {
            id: templateDetails.id,
          },
          include: {
            TemplateField: true,
            templateCategory: true,
          },
        });
        return successResponse(
          'template is updated successfully!',
          templateData,
        );
      } catch (error) {
        processException(error);
      }
    });
  }

  async deleteTemplate(id: number) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const templateDetails = await prisma.template.findFirst({
          where: {
            id: id,
          },
        });

        if (!templateDetails) {
          return errorResponse('Template not found!');
        }

        await prisma.templateField.deleteMany({
          where: {
            template_id: templateDetails.id,
          },
        });

        await prisma.template.delete({
          where: {
            id: id,
          },
        });

        return successResponse('Template has been deleted successfully');
      });
    } catch (error) {
      processException(error);
    }
  }

  async generateContent(payload: any) {
    try {
      const checkValidation: ResponseModel =
        await checkValidationForContentGenerateUseTemplate(payload);

      if (checkValidation.success === false) {
        return checkValidation;
      }

      const templateDetails = await this.prisma.template.findFirst({
        where: {
          id: payload.template_id,
        },
      });
      const prompt = templateDetails.prompt;
      

      const finalPrompt = await setDynamicValueInPrompt(prompt, payload);

      await this.openaiService.init();
      const response = await this.openaiService.textCompletion(
        finalPrompt,
        payload.number_of_result,
      );

      if (!response) {
        return errorResponse('Something went wrong!');
      }

      return successResponse('Text is generated successfully!', response);
    } catch (error) {
      processException(error);
    }
  }
}
