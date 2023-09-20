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
    this.openai = new Openai({
      apiKey: response.open_ai_secret,
    });
  }
  async textCompletion(prompt: string): Promise<any> {
    const response: any = await getAdminSettingsData(OpenAISettingSlugs);
    const completion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `${prompt}.Tone of voice must be ${
            response?.open_ai_default_tone_of_voice
              ? response?.open_ai_default_tone_of_voice
              : 'professional'
          }, Your language is ${
            response?.open_ai_default_language
          }, Language is ${response?.open_ai_default_language}, Maximum ${
            response?.open_ai_max_output_length
          } words`,
        },
      ],
      model: response?.open_ai_model
        ? response?.open_ai_model
        : 'gpt-3.5-turbo',
      temperature: Number(response?.open_ai_temperature)
        ? Number(response?.open_ai_temperature)
        : 0,
      max_tokens: Number(response?.open_ai_max_output_length)
        ? Number(response?.open_ai_max_output_length)
        : 20,
    });
    return completion;
  }
  async imageGenerate(prompt: string): Promise<Openai.Images.ImagesResponse> {
    const completion = await this.openai.images.generate({
      prompt: prompt,
      size: '512x512',
    });
    return completion;
  }
}
