import { AuthService } from '../application/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/application/users.service';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { EmailManager } from '../../../infrastructure/services/email.manager';
import { EmailAdapter } from '../../../infrastructure/adapters/email.adapter';

describe('AuthService – integration test', () => {
  let mongoServer: MongoMemoryServer;
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  const usersRepository = new UsersRepository();
  const usersQueryRepository = new UsersQueryRepository();

  // const emailAdapter = new EmailAdapter();
  const emailAdapterMock: jest.Mocked<EmailAdapter> = {
    sendEmail: jest.fn(),
  };

  const jwtService = new JwtService();
  const emailManager = new EmailManager(emailAdapterMock);
  const usersService = new UsersService(usersRepository);
  const authService = new AuthService(
    jwtService,
    emailManager,
    usersService,
    usersRepository,
    usersQueryRepository,
  );

  describe('Create user', () => {
    it('1 – this.emailAdapter.sendEmail should be called', async () => {
      const inputModel = {
        login: 'first login',
        email: 'first-email@.com',
        password: 'qwerty',
      };
      const result = await authService.createUser(inputModel);

      expect(emailAdapterMock.sendEmail).toBeCalled();
    });

    it('2 – should return created user', async () => {
      const inputModel = {
        login: 'first login',
        email: 'first-email@.com',
        password: 'qwerty',
      };
      const result = await authService.createUser(inputModel);

      expect(result).toBeDefined();
    });
  });
});
