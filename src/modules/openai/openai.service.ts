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
    const response: any = await getAdminSettingsData(OpenAISettingSlugs);
    console.log(response.open_ai_secret, 'response');
    this.openai = new Openai({
      apiKey: response.open_ai_secret,
    });
    // apiKey: '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',
  }
  async textCompletion(
    prompt: string,
  ): Promise<Openai.Chat.Completions.ChatCompletion.Choice[]> {
    const response: any = await getAdminSettingsData(OpenAISettingSlugs);

    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: response?.open_ai_model
        ? response?.open_ai_model
        : 'gpt-3.5-turbo',
      temperature: response?.open_ai_temperature
        ? response?.open_ai_temperature
        : 0,
      max_tokens: response?.open_ai_max_output_length
        ? response?.open_ai_max_output_length
        : 20,
    });
    return completion.choices;
  }
  async imageGenerate(prompt: string): Promise<Openai.Images.ImagesResponse> {
    const completion = await this.openai.images.generate({
      prompt: prompt,
      size: '512x512',
    });
    return completion;
  }
}
