import { Injectable } from '@nestjs/common';
import {
  addPhotoPrefix,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { CreateNewReviewDto } from './dto/create-new-review.dto';
import { PrismaService } from '../prisma/prisma.service';
import { DefaultPaginationMetaData } from 'src/shared/helpers/coreConstant';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewReview(payload: CreateNewReviewDto) {
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

        image_url = addPhotoPrefix(fileDetails.file_path);
      }
      const newReview = await this.prisma.review.create({
        data: {
          user_name: payload.user_name,
          designation: payload.designation,
          user_image_url: image_url,
          comment: payload.comment,
          rating: payload.rating,
          status: payload.status,
        },
      });
      return successResponse('New review is addedd successfully!', newReview);
    } catch (error) {
      processException(error);
    }
  }

  async getReviewListForAdmin(payload: any) {
    try {
      const data = {};
      const whereClause = payload.search
        ? {
            OR: [
              {
                user_name: {
                  contains: payload.search,
                },
              },
              {
                designation: {
                  contains: payload.search,
                },
              },
            ],
          }
        : {};
      if (payload.limit || payload.offset) {
        const paginate = await paginatioOptions(payload);

        const reviewList = await this.prisma.review.findMany({
          where: whereClause,
          ...paginate,
        });

        const paginationMeta =
          reviewList.length > 0
            ? await paginationMetaData('review', payload)
            : DefaultPaginationMetaData;

        data['list'] = reviewList;
        data['meta'] = paginationMeta;
      } else {
        const reviewList = await this.prisma.review.findMany({
          where: whereClause,
        });

        data['list'] = reviewList;
      }

      return successResponse('Review List data', data);
    } catch (error) {
      processException(error);
    }
  }
}
