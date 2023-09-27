import { Injectable } from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';
import {
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FaqService {
    constructor(private readonly prisma: PrismaService) { }
    
  async createFaq(payload: CreateFaqDto) {
      try {
          const faqDetails = await this.prisma.faq.create({
              data: {
                  ...payload
              }
          });


      return successResponse('Faq is created successfully!', faqDetails);
    } catch (error) {
      processException(error);
    }
  }
}
