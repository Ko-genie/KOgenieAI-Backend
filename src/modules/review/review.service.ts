import { Injectable } from '@nestjs/common';
import {
  processException,
  successResponse,
} from 'src/shared/helpers/functions';

@Injectable()
export class ReviewService {
  async createNewReview(payload: any) {
    try {
      return successResponse('New review is addedd successfully!');
    } catch (error) {
      processException(error);
    }
  }
}
