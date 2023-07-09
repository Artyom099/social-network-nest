import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { basicConstants } from '../constants';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // super();
    super({
      passReqToCallback: true,
    });
  }

  public validate = async (req, username, password): Promise<boolean> => {
    console.log('+++');
    if (
      basicConstants.userName === username &&
      basicConstants.password === password
    ) {
      return true;
    } else {
      throw new UnauthorizedException();
    }
  };
}
