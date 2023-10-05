import { Body, Controller, Post } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateNewReviewDto } from './dto/create-new-review.dto';

@Controller('admin')
export class AdminReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create-new-review')
  createNewReview(@Body() payload: CreateNewReviewDto) {
    return this.reviewService.createNewReview(payload);
  }
}
