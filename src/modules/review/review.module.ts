import { Module } from '@nestjs/common';
import { AdminReviewController } from './admin-review.controller';
import { ReviewService } from './review.service';

@Module({
  controllers: [AdminReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
