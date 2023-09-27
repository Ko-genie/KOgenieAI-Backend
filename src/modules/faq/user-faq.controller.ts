import { Controller } from '@nestjs/common';
import { FaqService } from './faq.service';

@Controller('user')
export class UserFaqController {
  constructor(private readonly faqService: FaqService) {}
}
