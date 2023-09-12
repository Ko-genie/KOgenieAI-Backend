import { Type } from '@nestjs/common';
import { User } from '@prisma/client';
import { emailAppName } from 'src/shared/helpers/functions';
import { MessageInterface } from 'src/shared/mail/messages/message.interface';
import { ChannelInterface } from 'src/shared/notification/chanels/channel.interface';
import { MailChannel } from 'src/shared/notification/chanels/mail.channel';
import { NotificationTemplate } from 'src/shared/notification/notification.template';

export class SendTestMail {
  constructor(private readonly data: any) {}

  broadcastOn(): Type<ChannelInterface>[] {
    return [MailChannel];
  }

  async toMail(notifiable: User): Promise<MessageInterface> {
    return (
      await NotificationTemplate.toEmail('test_mail.html', {
        subject: (await emailAppName()) + ' ' + 'Email Test',
        title: 'Email Verification',
        name: `${notifiable.user_name}`,
        email: notifiable.email,
      })
    ).to(notifiable.email);
  }

  queueable(): boolean {
    return false;
  }
}
