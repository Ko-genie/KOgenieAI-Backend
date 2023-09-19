import { Injectable, NotFoundException } from '@nestjs/common';
import Openai from 'openai';
import { SettingService } from '../admin/settings/settings.service';
import { getAdminSettingsData } from 'src/shared/helpers/functions';
import { OpenAISettingSlugs } from 'src/shared/constants/array.constants';

@Injectable()
export class OpenAi {
  private openai: Openai;

  constructor() {}

  async init() {
    const response = await getAdminSettingsData(OpenAISettingSlugs);
    console.log(response, 'response');
    this.openai = new Openai({
      apiKey: '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',
    });
  }
  async textCompletion(
    prompt: string,
  ): Promise<Openai.Chat.Completions.ChatCompletion.Choice[]> {
    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      temperature: 0,
      max_tokens: 2,
    });
    return completion.choices;
  }
}
