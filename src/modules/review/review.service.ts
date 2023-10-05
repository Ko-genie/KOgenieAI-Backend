import { Injectable } from '@nestjs/common';
import {
  addPhotoPrefix,
  errorResponse,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { CreateNewReviewDto } from './dto/create-new-review.dto';
import { PrismaService } from '../prisma/prisma.service';

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
}
