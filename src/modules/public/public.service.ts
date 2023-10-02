import { Injectable } from "@nestjs/common";
import { LanguageListJsonArray } from "src/shared/constants/array.constants";
import { successResponse } from "src/shared/helpers/functions";

@Injectable()
export class PublicService {
  async getAllLanguageList() {
    const languageList = LanguageListJsonArray;
    return successResponse('Language list', languageList);
  }
}