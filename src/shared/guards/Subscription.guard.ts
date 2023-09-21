import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { PaymentsService } from 'src/modules/payments/payments.service';
import { coreConstant } from '../helpers/coreConstant';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const type =
      this.reflector.get<string>('subscriptionType', context.getHandler()) ||
      'image';

    const {
      package_valid,
      image_limit_exceed,
      word_limit_exceed,
      package: myPackage,
    }: any = await this.paymentsService.getUserPackage(user);
    const available_features = myPackage.available_features
      .split(',')
      .map(Number);
    if (!package_valid) {
      throw new ForbiddenException('Your package is not valid.');
    }

    if (type === 'text') {
      if (word_limit_exceed) {
        throw new ForbiddenException('Text limit exceeded.');
      }
      if (
        !available_features.includes(
          coreConstant.AVAILABLE_FEATURES.CONTENT_WRITING,
        )
      ) {
        throw new ForbiddenException(
          'Content writing feature is not available for your package.',
        );
      }
    }

    if (type === 'image') {
      if (image_limit_exceed) {
        throw new ForbiddenException('Image limit exceeded.');
      }
      if (
        !available_features.includes(
          coreConstant.AVAILABLE_FEATURES.IMAGE_GENERATION,
        )
      ) {
        throw new ForbiddenException(
          'Image generation feature is not available for your package.',
        );
      }
    }

    return true;
  }
}
