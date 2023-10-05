import { Body, Controller, Post } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('admin')
export class AdminReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create-new-review')
  createNewReview(@Body() payload: any) {
    return this.reviewService.createNewReview(payload);
  }
}
