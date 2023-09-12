import {
  creativityConstant,
  openAiModelConstant,
  openAiToneOfVoiceConstant,
} from '../helpers/coreConstant';

export const GeneralSettingsSlugs = [
  'site_name',
  'site_url',
  'site_email',
  'default_country',
  'default_currency',
  'registration_status',
  'free_usage_word_upon_registration',
  'free_usage_image_upon_registration',
  'social_login_facebook_status',
  'social_login_google_status',
  'google_analytics_tracking_id',
  'meta_title',
  'meta_description',
  'meta_keywords',
  'site_logo',
  'site_fav_icon',
];

export const SMTPSettingsSlugs = [
  'mail_driver',
  'smtp_host',
  'smtp_port',
  'smtp_user_name',
  'smtp_password',
  'smtp_sender_email',
  'smtp_sender_name',
  'smtp_encryption',
];

export const TermsConditionSlugs = ['privacy_policy', 'terms_condition'];

export const OpenAISettingSlugs = [
  'open_ai_secret',
  'open_ai_model',
  'open_ai_default_language',
  'open_ai_default_tone_of_voice',
  'open_ai_default_creativity',
  'open_ai_default_stream_server',
  'open_ai_max_input_length',
  'open_ai_max_output_length',
];

export const OpenAiModelKeyArray = [
  openAiModelConstant.CHAT_GPT_ONE,
  openAiModelConstant.CHAT_GPT_TWO,
  openAiModelConstant.CHAT_GPT_THREE,
  openAiModelConstant.CHAT_GPT_FOUR,
];

export const OpenAiToneOfVoiceKeyArray = [
  openAiToneOfVoiceConstant.PROFESSIONAL,
  openAiToneOfVoiceConstant.FUNNY,
  openAiToneOfVoiceConstant.CASUAL,
  openAiToneOfVoiceConstant.EXCITED,
  openAiToneOfVoiceConstant.WITTY,
  openAiToneOfVoiceConstant.SARCASTIC,
  openAiToneOfVoiceConstant.FEMININE,
  openAiToneOfVoiceConstant.MASCULINE,
  openAiToneOfVoiceConstant.BOLD,
  openAiToneOfVoiceConstant.DRAMATIC,
  openAiToneOfVoiceConstant.GRUMPY,
  openAiToneOfVoiceConstant.SECRETIVE,
];

export const CreativityKeyArray = [
  creativityConstant.ECONOMIC,
  creativityConstant.AVERAGE,
  creativityConstant.GOOD,
  creativityConstant.PREMIUM
];
