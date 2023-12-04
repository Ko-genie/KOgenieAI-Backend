import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import nodemailerExpressHandlebars from 'nodemailer-express-handlebars';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { promisify } from 'util';
import { readFile } from 'fs';
import { SMTPSettingsSlugs } from '../constants/array.constants';
import {
  addPhotoPrefix,
  getAdminSettingsData,
  processException,
  successResponse,
} from '../helpers/functions';

const readFileAsync = promisify(readFile);

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  private smtpConfig: any;

  private async loadTemplate(templatePath: string): Promise<string> {
    const fullPath = path.join(
      process.cwd(),
      'src',
      'shared',
      'mail',
      'templates',
      templatePath,
    );
    return await readFileAsync(fullPath, 'utf8');
  }

  private async setupTemplates() {
    this.smtpConfig = await getAdminSettingsData(SMTPSettingsSlugs);
    const handlebarsOptions = {
      viewEngine: {
        extname: '.hbs',
        layoutsDir: path.join(__dirname, 'templates'),
        defaultLayout: 'template',
      },
      viewPath: path.join(__dirname, 'templates'),
    };

    this.transporter = nodemailer.createTransport({
      host: this.smtpConfig.smtp_host,
      port: this.smtpConfig.smtp_port,
      secure: false,
      auth: {
        user: this.smtpConfig.smtp_user_name,
        pass: this.smtpConfig.smtp_password,
      },
    });

    this.transporter.use(
      'compile',
      nodemailerExpressHandlebars(handlebarsOptions),
    );
  }

  async sendMail(to: string, subject: string, template: string, context?: any) {
    try {
      await this.setupTemplates();

      const headerTemplate = await this.loadTemplate('headerTemplate.hbs');
      const footerTemplate = await this.loadTemplate('footerTemplate.hbs');
      const htmlTemplate = await this.loadTemplate(template);

      const siteLogo: any = await getAdminSettingsData('site_logo');

      const data = {
        context: context,
        frontEndUrl: process.env.FRONTEND_URL,
        logoUrl: addPhotoPrefix(siteLogo.site_logo),
        currentDate: new Date().toLocaleDateString(),
      };

      // Compile the template using handlebars directly
      const compiledHeader = handlebars.compile(headerTemplate);
      const compiledFooter = handlebars.compile(footerTemplate);
      const compiledTemplate = handlebars.compile(htmlTemplate);

      const renderedHeader = compiledHeader(data);
      const renderedFooter = compiledFooter(data);
      const renderedContent = compiledTemplate(data);

      const finalHtml = renderedHeader + renderedContent + renderedFooter;

      const options: nodemailer.SendMailOptions = {
        from: 'your-email@example.com',
        to,
        subject,
        html: finalHtml,
      };

      this.transporter.sendMail(options);
      return successResponse('Mail is sent successfully!');
    } catch (error) {
      console.error(error);
      processException(error);
      throw error;
    }
  }
}
