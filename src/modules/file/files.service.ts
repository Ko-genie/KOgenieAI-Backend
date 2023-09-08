import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import {
  errorResponse,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}
  async getMyUploadedFiles(user: User): Promise<ResponseModel> {
    try {
      const myFiles = await this.prisma.myUploads.findMany({
        where: {
          user_id: user.id,
        },
      });
      if (!myFiles) {
        return errorResponse('No files found');
      }
      return successResponse('Upload successfull', myFiles);
    } catch (error) {
      processException(error);
    }
  }
}
