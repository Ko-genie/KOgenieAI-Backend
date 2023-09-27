import { Body, Controller, Post } from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';

@Controller('admin-faq')
export class AdminFaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post('create')
  createFaq(@Body() payload: CreateFaqDto) {
      return this.faqService.createFaq(payload);
  }
}
