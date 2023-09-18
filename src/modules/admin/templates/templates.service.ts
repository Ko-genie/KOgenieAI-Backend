import { Injectable } from "@nestjs/common";
import { processException, successResponse } from "src/shared/helpers/functions";

@Injectable()
export class TemplateService {
  async addNewCategory() {
    try {
      return successResponse('Category is added successfully!');
    } catch (error) {
      processException(error);
    }
  }
}
