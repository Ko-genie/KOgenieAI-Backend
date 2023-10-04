import { Injectable } from '@nestjs/common';
import {
  checkValidationForContentGenerateUseTemplate,
  saveBase64ImageAsJpg,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  setDynamicValueInPrompt,
  successResponse,
  wordCountMultilingual,
  addPhotoPrefix,
  generatePromptForCode,
  generatePromptForTranslate,
} from 'src/shared/helpers/functions';
import { AddNewCategoryDto } from './dto/add-new-category.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AddNewTemplateDto } from './dto/add-new-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { GenerateImageDto } from './dto/generate-image.dto';
import { ResponseModel } from 'src/shared/models/response.model';
import { MyImages, Template, User } from '@prisma/client';
import { OpenAi } from '../openai/openai.service';
import { PaymentsService } from '../payments/payments.service';
import {
  DefaultPaginationMetaData,
  coreConstant,
} from 'src/shared/helpers/coreConstant';
import { MakeTemplateFavourite } from './dto/make-template-favourite.dto';
import { GenerateOpenAiCodeDto } from './dto/generate-code.dto';
import { paginateInterface } from 'src/shared/constants/types';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { LanguageListJsonArray } from 'src/shared/constants/array.constants';
import { title } from 'process';
import { TextTranslateDto } from './dto/text-translate.dto';

@Injectable()
export class TemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentsService,
  ) {}
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
      const { name, description, status } = payload;
      const data = await this.prisma.templateCategory.update({
        where: {
          id: payload.id,
        },
        data: {
          name,
          description,
          status,
        },
      });

      return successResponse('Category is update successfully!', data);
    } catch (error) {
      processException(error);
    }
  }

  async getListCategory(payload: any) {
    try {
      const data = {};
      const whereClause = {
        OR: [
          {
            name: {
              contains: payload.search,
            },
          },
        ],
      };
      if (payload.limit || payload.offset) {
        const paginate = await paginatioOptions(payload);

        const categoryList = await this.prisma.templateCategory.findMany({
          where: whereClause,
          ...paginate,
        });

        const paginationMeta =
          categoryList.length > 0
            ? await paginationMetaData('templateCategory', payload)
            : DefaultPaginationMetaData;

        data['list'] = categoryList;
        data['meta'] = paginationMeta;
      } else {
        const categoryList = await this.prisma.templateCategory.findMany({
          where: whereClause,
        });

        data['list'] = categoryList;
      }

      return successResponse('Category List data', data);
    } catch (error) {
      processException(error);
    }
  }

  async getListCategoryForUser(payload: any) {
    try {
      const data = {};
      if (payload.limit || payload.offset) {
        const paginate = await paginatioOptions(payload);

        const categoryList = await this.prisma.templateCategory.findMany({
          where: {
            status: coreConstant.ACTIVE,
          },
          ...paginate,
        });

        const paginationMeta = await paginationMetaData(
          'templateCategory',
          payload,
        );

        data['list'] = categoryList;
        data['meta'] = paginationMeta;
      } else {
        const categoryList = await this.prisma.templateCategory.findMany({
          where: {
            status: coreConstant.ACTIVE,
          },
        });

        data['list'] = categoryList;
      }

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
        status,
        icon_tag,
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
          status,
          icon_tag,
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
          status,
          icon_tag,
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
            status,
            icon_tag,
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

  async generateContent(user: User, payload: any) {
    try {
      const checkValidation: ResponseModel =
        await checkValidationForContentGenerateUseTemplate(payload);

      if (checkValidation.success === false) {
        return checkValidation;
      }

      const checkUserPackageResponse: any =
        await this.paymentService.checkSubscriptionStatus(user);

      if (checkUserPackageResponse.success === false) {
        return checkUserPackageResponse;
      }
      const userPackageData: any = checkUserPackageResponse.data;

      const remainingWords =
        userPackageData.total_words - userPackageData.used_words;
      if (
        userPackageData.word_limit_exceed ||
        payload.maximum_length > remainingWords
      ) {
        return errorResponse(
          'Your word limit exceed, please, purchase an addiotional package!',
        );
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
        userPackageData.model,
      );

      if (!response) {
        return errorResponse('Something went wrong!');
      }

      const resultOfPrompt = response.choices[0].message.content;
      const wordCount = wordCountMultilingual(resultOfPrompt);

      await this.paymentService.updateUserUsedWords(
        userPackageData.id,
        wordCount,
      );
      const title: string = payload.document_title
        ? payload.document_title
        : 'Untitled Document';
      await this.saveDocument(
        title,
        finalPrompt,
        resultOfPrompt,
        templateDetails.id,
        user.id,
        wordCount,
      );

      return successResponse('Text is generated successfully!', response);
    } catch (error) {
      if (error.error.message) {
        return errorResponse(error.error.message);
      }
      processException(error);
    }
  }

  async saveDocument(
    title: string,
    prompt: string,
    result: string,
    template_id: number,
    user_id: number,
    total_used_words: number,
  ) {
    try {
      const saveDocument = await this.prisma.myDocuments.create({
        data: {
          title,
          prompt,
          result,
          template_id,
          user_id,
          total_used_words,
        },
      });
      return saveDocument;
    } catch (error) {
      processException(error);
    }
  }

  async generateImage(user: User, payload: GenerateImageDto) {
    try {
      const checkUserPackageResponse: any =
        await this.paymentService.checkSubscriptionStatus(user);

      if (checkUserPackageResponse.success === false) {
        return checkUserPackageResponse;
      }
      const userPackageData: any = checkUserPackageResponse.data;

      if (userPackageData.image_limit_exceed) {
        return errorResponse(
          'Your image limit exceed, please, purchase an addiotional package!',
        );
      }

      await this.openaiService.init();

      const response = await this.openaiService.imageGenerate(
        payload.prompt,
        payload.image_size,
      );
      const imageUrl: any = await saveBase64ImageAsJpg(
        response.data[0].b64_json,
      );
      await this.saveImageDocument(
        payload.prompt,
        imageUrl.imageUrl,
        imageUrl.fileName,
        user.id,
      );
      if (!response) {
        return errorResponse('Something went wrong!');
      }
      this.paymentService.updateUserUsedImages(userPackageData.id, 1);

      return successResponse('Image is generated successfully!', response);
    } catch (error) {
      if (error.error.message) {
        return errorResponse(error.error.message);
      }
      processException(error);
    }
  }
  async saveImageDocument(
    prompt: string,
    image_url: string,
    image_name: string,
    user_id: number,
  ): Promise<MyImages> {
    try {
      const saveImage = await this.prisma.myImages.create({
        data: {
          prompt,
          image_url: image_url,
          image_name,
          user_id,
        },
      });

      return saveImage;
    } catch (error) {
      processException(error);
    }
  }
  async getAllImageDocument(
    user: User,
    paginationOptions: any,
  ): Promise<ResponseModel> {
    try {
      const paginate = await paginatioOptions(paginationOptions);

      let imageDocuments = await this.prisma.myImages.findMany({
        where: {
          user_id: user.id,
        },
        orderBy: {
          created_at: 'desc',
        },
        ...paginate,
      });
      let images_with_url = [];
      imageDocuments.map((image) => {
        image.image_url = addPhotoPrefix(image.image_url);
        images_with_url.push(image);
      });
      const paginationMeta = await paginationMetaData(
        'myImages',
        paginationOptions,
      );

      const data = {
        list: images_with_url,
        meta: paginationMeta,
      };

      return successResponse('Image Documents List by user', data);
    } catch (error) {
      processException(error);
    }
  }
  async getImageDocumentDetails(
    id: number,
    user: User,
  ): Promise<ResponseModel> {
    try {
      let imageDocumentDetails = await this.prisma.myImages.findFirst({
        where: {
          id,
          user_id: user.id,
        },
      });
      imageDocumentDetails.image_url = addPhotoPrefix(
        imageDocumentDetails.image_url,
      );

      if (!imageDocumentDetails) {
        return errorResponse('Image Document not found!');
      }

      return successResponse('Image Document details', imageDocumentDetails);
    } catch (error) {
      processException(error);
    }
  }
  async getDocumentListByPaginate(payload: paginateInterface, user: User) {
    try {
      const paginate = await paginatioOptions(payload);

      const documentList = await this.prisma.myDocuments.findMany({
        where: {
          user_id: user.id,
        },
        include: {
          template: {
            select: {
              title: true,
              color: true,
              templateCategory: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        ...paginate,
      });
      const paginationMeta = await paginationMetaData('myDocuments', payload);

      const data = {
        list: documentList,
        meta: paginationMeta,
      };
      return successResponse('Document List by paginate', data);
    } catch (error) {
      processException(error);
    }
  }

  async getDocumentListByPaginateAdmin(payload: paginateInterface) {
    try {
      const paginate = await paginatioOptions(payload);

      const documentList = await this.prisma.myDocuments.findMany({
        ...paginate,
      });
      const paginationMeta = await paginationMetaData('myDocuments', payload);

      const data = {
        list: documentList,
        meta: paginationMeta,
      };
      return successResponse('Document List by paginate', data);
    } catch (error) {
      processException(error);
    }
  }

  async getDocumentDetails(id: number) {
    try {
      const documentDetails = await this.prisma.myDocuments.findFirst({
        where: { id: id },
        include: {
          template: {
            include: {
              templateCategory: true,
            },
          },
        },
      });
      if (!documentDetails) {
        return errorResponse('Invalid request!');
      }
      return successResponse('Document details', documentDetails);
    } catch (error) {
      processException(error);
    }
  }
  async getUserDocumentDetails(id: number, user: User) {
    try {
      const documentDetails = await this.prisma.myDocuments.findFirst({
        where: {
          id: id,
          user_id: user.id,
        },
        include: {
          template: {
            include: {
              templateCategory: true,
            },
          },
        },
      });
      if (!documentDetails) {
        return errorResponse('Invalid request!');
      }
      return successResponse('Document details', documentDetails);
    } catch (error) {
      processException(error);
    }
  }

  async getTemplateListForUser(user: User, payload: any) {
    try {
      const whereCondition = {
        ...(payload.category_id
          ? { category_id: Number(payload.category_id) }
          : {}),
      };
      const paginate = await paginatioOptions(payload);

      const templateList = await this.prisma.template.findMany({
        where: whereCondition,
        include: {
          templateCategory: true,
          TemplateField: true,
          FavouriteTemplate: true,
        },
        orderBy: {
          updated_at: 'desc',
        },
        ...paginate,
      });

      const paginationMeta =
        templateList.length > 0
          ? await paginationMetaData('template', payload)
          : DefaultPaginationMetaData;

      const data = {
        list: templateList,
        meta: paginationMeta,
      };
      return successResponse('Template list', data);
    } catch (error) {
      processException(error);
    }
  }

  async makeTemplateFavourite(user: User, payload: MakeTemplateFavourite) {
    try {
      const favouriteTemplateDetails =
        await this.prisma.favouriteTemplate.findFirst({
          where: {
            user_id: user.id,
            template_id: payload.template_id,
          },
        });

      let updateFavouriteTemplate;
      if (favouriteTemplateDetails) {
        updateFavouriteTemplate = await this.prisma.favouriteTemplate.update({
          where: {
            id: favouriteTemplateDetails.id,
          },
          data: {
            status:
              favouriteTemplateDetails.status === coreConstant.ACTIVE
                ? coreConstant.INACTIVE
                : coreConstant.ACTIVE,
          },
        });
      } else {
        updateFavouriteTemplate = await this.prisma.favouriteTemplate.create({
          data: {
            user_id: user.id,
            template_id: payload.template_id,
            status: coreConstant.ACTIVE,
          },
        });
      }

      if (updateFavouriteTemplate.status === coreConstant.ACTIVE) {
        return successResponse('Template is marked as favourite!');
      }
      {
        return successResponse('Template is removed from favourite!');
      }
    } catch (error) {
      processException(error);
    }
  }

  async generateOpenAiCode(user: User, payload: GenerateOpenAiCodeDto) {
    try {
      const checkUserPackageResponse: any =
        await this.paymentService.checkSubscriptionStatus(user);

      if (checkUserPackageResponse.success === false) {
        return checkUserPackageResponse;
      }
      const userPackageData: any = checkUserPackageResponse.data;

      if (userPackageData.word_limit_exceed) {
        return errorResponse(
          'Your word limit exceed, please, purchase an addiotional package!',
        );
      }

      const promot: string = await generatePromptForCode(
        payload.description,
        payload.coding_language,
        payload.coding_level,
      );

      await this.openaiService.init();
      const responseOpenAi = await this.openaiService.textCompletion(
        promot,
        1,
        userPackageData.model,
      );

      if (!responseOpenAi) {
        return errorResponse('Something went wrong!');
      }

      const resultOfPrompt = responseOpenAi.choices[0].message.content;
      const wordCount = wordCountMultilingual(resultOfPrompt);

      await this.paymentService.updateUserUsedWords(
        userPackageData.id,
        wordCount,
      );

      const saveGeneratedCode = await this.prisma.generatedCode.create({
        data: {
          title: payload.title,
          prompt: promot,
          result: resultOfPrompt,
          total_used_words: wordCount,
          user_id: user.id,
        },
      });

      return successResponse('Generate Code successfully!', saveGeneratedCode);
    } catch (error) {
      processException(error);
    }
  }

  async getGeneratedCodeListOfUser(user: User, payload: any) {
    try {
      const paginate = await paginatioOptions(payload);

      const generatedCodeList = await this.prisma.generatedCode.findMany({
        where: {
          user_id: user.id,
        },
        ...paginate,
      });

      const paginationMeta = await paginationMetaData('generatedCode', payload);

      const data = {
        list: generatedCodeList,
        meta: paginationMeta,
      };
      return successResponse('Generated code list', data);
    } catch (error) {
      processException(error);
    }
  }

  async getGeneratedCodeDetails(id: number, user?: User) {
    try {
      const whereCondition = {
        id: id,
        ...(user && user.role === coreConstant.USER_ROLE_USER
          ? { user_id: user.id }
          : {}),
      };

      const generatedCodeDetails = await this.prisma.generatedCode.findFirst({
        where: whereCondition,
      });

      if (!generatedCodeDetails) {
        return errorResponse('Invalid request!');
      }
      return successResponse('Generated code details', generatedCodeDetails);
    } catch (error) {
      processException(error);
    }
  }

  async deleteGeneratedCode(id: number, user: User) {
    try {
      const whereCondition = {
        id: id,
        ...(user && user.role === coreConstant.USER_ROLE_USER
          ? { user_id: user.id }
          : {}),
      };
      const documentDetails = await this.prisma.generatedCode.findFirst({
        where: whereCondition,
      });

      if (!documentDetails) {
        return errorResponse('Invalid request!');
      }

      await this.prisma.generatedCode.delete({
        where: {
          id: documentDetails.id,
        },
      });

      return successResponse('Translated Document is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }

  async updateDocumentByUser(user: User, payload: UpdateDocumentDto) {
    try {
      const documentDetails = await this.prisma.myDocuments.findFirst({
        where: {
          id: payload.document_id,
          user_id: user.id,
        },
      });

      if (!documentDetails) {
        return errorResponse('Invalid Request to save the document!');
      }

      await this.prisma.myDocuments.update({
        where: {
          id: documentDetails.id,
        },
        data: {
          title: payload.title,
          result: payload.result,
        },
      });

      return successResponse('Document is updated successfully!');
    } catch (error) {
      processException(error);
    }
  }

  async getAllLanguageList() {
    const languageList = LanguageListJsonArray;
    return successResponse('Language list', languageList);
  }

  async deleteDocument(id: number, user: User) {
    try {
      const whereCondition = {
        ...(user && user.role === coreConstant.USER_ROLE_USER
          ? { user_id: user.id }
          : {}),
      };
      const documentDetails = await this.prisma.myDocuments.findFirst({
        where: whereCondition,
      });

      if (!documentDetails) {
        return errorResponse('Invalid request!');
      }

      await this.prisma.myDocuments.delete({
        where: {
          id: id,
        },
      });

      return successResponse('Document is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }

  async textTranslate(user: User, payload: TextTranslateDto) {
    try {
      const checkUserPackageResponse: any =
        await this.paymentService.checkSubscriptionStatus(user);

      if (checkUserPackageResponse.success === false) {
        return checkUserPackageResponse;
      }
      const userPackageData: any = checkUserPackageResponse.data;

      if (userPackageData.word_limit_exceed) {
        return errorResponse(
          'Your word limit exceed, please, purchase an addiotional package!',
        );
      }

      const promot: string = await generatePromptForTranslate(
        payload.text,
        payload.language,
      );

      await this.openaiService.init();
      const responseOpenAi = await this.openaiService.textCompletion(
        promot,
        1,
        userPackageData.model,
      );

      if (!responseOpenAi) {
        return errorResponse('Something went wrong!');
      }

      const resultOfPrompt = responseOpenAi.choices[0].message.content;
      const wordCount = wordCountMultilingual(resultOfPrompt);

      await this.paymentService.updateUserUsedWords(
        userPackageData.id,
        wordCount,
      );

      const saveGeneratedTranslation =
        await this.prisma.textTranslateDocument.create({
          data: {
            title: payload.title,
            text: payload.text,
            language: payload.language,
            prompt: promot,
            result: resultOfPrompt,
            total_used_words: wordCount,
            user_id: user.id,
          },
        });

      return successResponse(
        'Generate Transaltion is done successfully!',
        saveGeneratedTranslation,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getGeneratedTranslationList(user: User, payload: any) {
    try {
      const paginate = await paginatioOptions(payload);

      const whereCondition = {
        ...(user && user.role === coreConstant.USER_ROLE_USER
          ? { user_id: user.id }
          : {}),
      };
      const generatedTranslationList =
        await this.prisma.textTranslateDocument.findMany({
          where: whereCondition,
          ...paginate,
        });

      const paginationMeta = await paginationMetaData(
        'textTranslateDocument',
        payload,
      );

      const data = {
        list: generatedTranslationList,
        meta: paginationMeta,
      };
      return successResponse('Generated translation list', data);
    } catch (error) {
      processException(error);
    }
  }

  async getGeneratedTranslationDetails(id: number, user: User) {
    try {
      const whereCondition = {
        id: id,
        ...(user && user.role === coreConstant.USER_ROLE_USER
          ? { user_id: user.id }
          : {}),
      };

      const generatedCodeDetails =
        await this.prisma.textTranslateDocument.findFirst({
          where: whereCondition,
        });

      if (!generatedCodeDetails) {
        return errorResponse('Invalid request!');
      }
      return successResponse(
        'Generated translation details',
        generatedCodeDetails,
      );
    } catch (error) {
      processException(error);
    }
  }
}
