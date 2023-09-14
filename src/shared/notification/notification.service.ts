import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { NotificationInterface } from './notification.interface';
import { User } from '@prisma/client';
import { ChannelInterface } from './chanels/channel.interface';
import {
  errorResponse,
  processException,
  successResponse,
} from '../helpers/functions';
import { ResponseModel } from '../models/response.model';

@Injectable()
export class NotificationService {
  constructor(private moduleRef: ModuleRef) {}

  send(notification: NotificationInterface, notifiable: User): Promise<any> {
    const channels = notification.broadcastOn();
    return Promise.all(
      channels.map(async (channel: Type<ChannelInterface>) => {
        const channelObj: ChannelInterface = await this.resolveChannel(channel);
        await channelObj.send(notifiable, notification);
      }),
    );
  }

  async sendTo(
    notification: NotificationInterface,
    notifiable: User,
  ): Promise<Promise<ResponseModel>[]> {
    try {
      const channels = notification.broadcastOn();
      const results: any[] = [];
      for (const channel of channels) {
        const channelObj: ChannelInterface = await this.resolveChannel(channel);
        try {
          const value: any = await channelObj.sendTo(notifiable, notification);
        } catch (channelError) {
          console.log(channelError.message);
          results.push(errorResponse(channelError.message));
        }
      }
      if (results.length) {
        return results;
      } else {
        results.push(successResponse('Message is sent successfully!'));
      }
      return results;
    } catch (error) {
      processException(error);
    }
  }

  /**
   * Resolve the channel needed to send the Notification
   * @param channel
   * @return Promise<ChannelInterface>
   */
  private async resolveChannel(channel: Type<ChannelInterface>) {
    try {
      return await this.moduleRef.create(channel);
    } catch (error) {
      processException(error);
    }
  }
}
