import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID:
        '721253678642-0trojfpjs5roclteq7o7ed75a1krkis6.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/api/auth/google/callback',
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user = {
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      first_name: name.givenName,
      last_name: name.familyName,
      name: `${name.givenName} ${name.familyName}`,
      picture: photos[0].value,
    };
    done(null, user);
  }
}
