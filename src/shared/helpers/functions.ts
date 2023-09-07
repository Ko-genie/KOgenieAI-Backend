import { PrismaService } from '../../../src/modules/prisma/prisma.service';
import { ResponseModel } from '../models/response.model';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Prisma } from '@prisma/client';
const crypto = require('crypto');
import * as bcrypt from 'bcrypt';
import { MyLogger } from '../../../src/modules/logger/logger.service';
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

export async function hashedPassword(password: string) {
  const saltOrRounds = 10;
  const hashPassword = await bcrypt.hash(password, saltOrRounds);
  return hashPassword;
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
