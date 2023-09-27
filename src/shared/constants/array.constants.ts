import {
  creativityConstant,
  faqTypeConstant,
  inputFieldTypeConstant,
  modeStatusConstant,
  openAiModelConstant,
  openAiToneOfVoiceConstant,
  packageTypeConstant,
  statusOnOffConstant,
} from '../helpers/coreConstant';

export const CommonSettingsSlugs = [
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
  'meta_title',
  'meta_description',
  'meta_keywords',
  'site_logo',
  'site_fav_icon',
  'google_auth_client_id',
];

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
  'open_ai_temperature',
  'open_ai_default_language',
  'open_ai_default_tone_of_voice',
  'open_ai_default_creativity',
  'open_ai_default_stream_server',
  'open_ai_max_input_length',
  'open_ai_max_output_length',
  'open_ai_max_token',
];

export const OpenAISettingWithoutSecretSlugs = [
  // 'open_ai_secret',
  'open_ai_model',
  'open_ai_temperature',
  'open_ai_default_language',
  'open_ai_default_tone_of_voice',
  'open_ai_default_creativity',
  'open_ai_default_stream_server',
  'open_ai_max_input_length',
  'open_ai_max_output_length',
  'open_ai_max_token',
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
  creativityConstant.PREMIUM,
];

export const PaymentMethodStripeSettingsSlugs = [
  'pm_stripe_status_mode',
  'pm_stripe_default_currency',
  'pm_stripe_client_id_sandbox',
  'pm_stripe_secret_key_sandbox',
  'pm_stripe_client_id_live',
  'pm_stripe_secret_key_live',
];

export const GoogleAuthCredentialsSlugs = [
  'google_auth_client_id',
  'google_auth_client_secret',
];

export const ModeStatusArray = [
  modeStatusConstant.LIVE,
  modeStatusConstant.SANDBOX,
];

export const StatusOnOffArray = [
  statusOnOffConstant.DEACTIVE,
  statusOnOffConstant.ACTIVE,
];

export const PackageTypeArray = [
  packageTypeConstant.REGULAR,
  packageTypeConstant.PREMIUM,
];

export const InputFieldTypeArray = [
  inputFieldTypeConstant.INPUT_FIELD,
  inputFieldTypeConstant.TEXTAREA_FIELD,
];

export const FaqTypeArray = [faqTypeConstant.LANDING_PAGE];
