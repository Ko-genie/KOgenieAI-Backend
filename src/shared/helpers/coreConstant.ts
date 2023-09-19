export const coreConstant = {
  USER_ROLE_ADMIN: 1,
  USER_ROLE_USER: 2,
  COMMON_PASSWORD: '123456',
  STATUS_INACTIVE: 0,
  STATUS_ACTIVE: 1,
  STATUS_PENDING: 2,
  IS_VERIFIED: 1,
  IS_NOT_VERIFIED: 0,
  VERIFICATION_TYPE_EMAIL: 1,
  FILE_DESTINATION: 'uploads',
  INACTIVE: 0,
  ACTIVE: 1,
  PENDING: 2,
  PACKAGE_TYPES: {
    SUBSCRIPTION: 1,
    PACKAGE: 2,
  },
  FEATURES_TYPES: {
    WRITING: 1,
    IMAGE: 2,
  },
  PAYMENT_METHODS: {
    STRIPE: 1,
    PAYPAL: 2,
  },
  PACKAGE_DURATION: {
    WEEKLY: 1,
    MONTHLY: 2,
    YEARLY: 3,
  },
  AVAILABLE_FEATURES: {
    CONTENT_WRITING: 1,
    IMAGE_GENERATION: 2,
  },
};

export const openAiModelConstant = {
  CHAT_GPT_ONE: 1,
  CHAT_GPT_TWO: 2,
  CHAT_GPT_THREE: 3,
  CHAT_GPT_FOUR: 4,
};

export const openAiToneOfVoiceConstant = {
  PROFESSIONAL: 'Professional',
  FUNNY: 'Funny',
  CASUAL: 'Casual',
  EXCITED: 'Excited',
  WITTY: 'Witty',
  SARCASTIC: 'Sarcastic',
  FEMININE: 'Feminine',
  MASCULINE: 'Masculine',
  BOLD: 'Bold',
  DRAMATIC: 'Dramatic',
  GRUMPY: 'Grumpy',
  SECRETIVE: 'Secretive',
};

export const creativityConstant = {
  ECONOMIC: 0.25,
  AVERAGE: 0.5,
  GOOD: 0.75,
  PREMIUM: 1,
};

export const modeStatusConstant = {
  LIVE: 1,
  SANDBOX: 2,
};

export const statusOnOffConstant = {
  DEACTIVE: 0,
  ACTIVE: 1,
};

export const packageTypeConstant = {
  REGULAR: 1,
  PREMIUM:2
}

export const inputFieldTypeConstant = {
  INPUT_FIELD: 1,
  TEXTAREA_FIELD:2
}
