import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(protected authRepository: AuthRepository) {}
}
