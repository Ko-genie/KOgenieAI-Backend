import { PrismaService } from '../../../src/modules/prisma/prisma.service';
import { ResponseModel } from '../models/response.model';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Prisma } from '@prisma/client';
const crypto = require('crypto');
import * as bcrypt from 'bcrypt';
import { count } from 'console';
export let app: NestExpressApplication;
export let PrismaClient: PrismaService;
export let myLogger;

export async function setApp(nestapp) {
  app = nestapp;

  PrismaClient = app.get(PrismaService);
  // myLogger = await app.resolve(MyLogger);
}
export function createUniqueCode() {
  let date = new Date().getTime();
  const id = crypto.randomBytes(10).toString('hex');
  const data = id + date;
  return data;
}
export function addPhotoPrefix(inputString: string): string {
  let prefix: string = process.env.BACKEND_URL;
  return `${prefix}${inputString}`;
}
export async function hashedPassword(password: string) {
  const saltOrRounds = 10;
  const hashPassword = await bcrypt.hash(password, saltOrRounds);
  return hashPassword;
}
export function wordCountMultilingual(inputString) {
  // Split the input string into words using Unicode properties
  const words = inputString
    .trim()
    .split(/[\p{White_Space}\p{Punctuation}]+/u)
    .filter(Boolean);

  // Return the count of words
  return words.length;
}

export function countWords(inputString) {
  const words = inputString.trim().split(/\s+/);

  return words.length;
}

export function processException(e) {
  checkPrismaError(e);
  if (
    (e.hasOwnProperty('response') &&
      !e.response.hasOwnProperty('success') &&
      !e.response.hasOwnProperty('data')) ||
    !e.hasOwnProperty('response')
  ) {
    console.error(e.stack);
    myLogger.error(e.stack);
  }
  throw e;
}
function checkPrismaError(e) {
  if (
    e instanceof Prisma.PrismaClientKnownRequestError ||
    e instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    console.error(e.stack);
    throw new Error('Something went wrong.');
  }
}
export function successResponse(msg?: string, data?: object): ResponseModel {
  return {
    success: true,
    message: msg ?? 'Response Success!',
    data: data || null,
  };
}
export function errorResponse(msg?: string, data?: object): ResponseModel {
  return {
    success: false,
    message: msg ?? 'Response Error!',
    data: data || null,
  };
}

export function generateMailKey() {
  return generateNDigitNumber(6);
}

function generateNDigitNumber(n) {
  return Math.floor(
    Math.pow(10, n - 1) + Math.random() * 9 * Math.pow(10, n - 1),
  );
}

export function addDayWithCurrentDate(dayCount: number) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + dayCount);
  return currentDate;
}

export function clearTrailingSlash(str: string) {
  return str.replace(/\/$/, '');
}

export function exchange_app_url() {
  return clearTrailingSlash(process.env.EXCHANGE_APP_URL ?? '');
}

export function base_url() {
  return clearTrailingSlash(process.env.APP_URL ?? '');
}

export function envAppName() {
  return process.env.APP_NAME || '';
}

export async function appName(): Promise<string> {
  return process.env.APP_NAME || '';
}

export async function emailAppName(): Promise<string> {
  const app_name = await appName();
  return app_name ? '[' + app_name + ']' : '';
}

export async function formatLimitOffset(payload: any) {
  let limit = payload.limit ? Math.abs(parseInt(payload.limit)) : 10;
  let offset = payload.offset ? Math.abs(parseInt(payload.offset)) : 1;

  limit = isNaN(limit) ? 10 : limit;
  limit = limit > 0 ? limit : 10;

  offset = isNaN(offset) ? 1 : offset;
  offset = offset > 0 ? offset : 1;

  return {
    limit,
    offset,
  };
}

export async function paginatioOptions(payload: any) {
  const limitOffset = await formatLimitOffset(payload);
  const limit = limitOffset.limit;
  const offset = limitOffset.offset;
  let skip = 0;
  if (limit > 0 && offset > 0) {
    skip = (offset - 1) * limit;
  }

  const data = {
    skip,
    take: limit,
  };

  return data;
}

export async function paginationMetaData(model: string, payload: any) {
  const total = await PrismaClient[model].count();

  const limitOffset = await formatLimitOffset(payload);

  const lastPage = Math.ceil(total / limitOffset.limit);
  const data = {
    total: total,
    lastPage: lastPage,
    currentPage: limitOffset.offset,
    perPage: limitOffset.limit,
    prev: limitOffset.offset > 1 ? limitOffset.offset - 1 : null,
    next: limitOffset.offset < lastPage ? limitOffset.offset + 1 : null,
  };

  return data;
}

export async function getAdminSettingsData(slugs?: any) {
  try {
    var data = {};

    if (Array.isArray(slugs)) {
      await Promise.all(
        slugs.map(async (slug) => {
          const slufInfo = await PrismaClient.adminSettings.findFirst({
            where: {
              slug: slug,
            },
          });

          if (slufInfo) {
            data[slug] = slufInfo.value;
          } else {
            data[slug] = null;
          }
        }),
      );
    } else if (typeof slugs === 'string') {
      const slufInfo = await PrismaClient.adminSettings.findFirst({
        where: {
          slug: slugs,
        },
      });
      data[slugs] = slufInfo.value;
    } else {
      const slugInfoList = await PrismaClient.adminSettings.findMany();
      slugInfoList.map((item) => {
        data[item.slug] = item.value;
      });
    }
    return data;
  } catch (error) {
    // processException(error);
  }
}

export const fetchMyUploadFilePathById = async (uploadId: number) => {
  const uploadDetails = await PrismaClient.myUploads.findFirst({
    where: { id: uploadId },
  });
  return uploadDetails?.file_path || '';
};

export const adminSettingsValueBySlug = async (slug: string) => {
  const adminSettingsData = await PrismaClient.adminSettings.findFirst({
    where: {
      slug: slug,
    },
  });

  return adminSettingsData?.value;
};
