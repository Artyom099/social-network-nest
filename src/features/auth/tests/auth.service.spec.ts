import { AuthService } from '../application/auth.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { EmailAdapter } from '../../../infrastructure/adapters/email.adapter';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';

describe('AuthService – integration test', () => {
  let mongoServer: MongoMemoryServer;
  let app;
  const emailAdapterMock: jest.Mocked<EmailAdapter> = {
    sendEmail: jest.fn(),
    sendGmail: jest.fn(),
  };
  let authService;
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env['MONGO_URL'] = mongoUri;

    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailAdapter)
      .useValue(emailAdapterMock)
      .compile();

    authService = app.get(AuthService);
    // await mongoose.connect(mongoUri);
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // const usersRepository = new UsersRepository();
  // const usersQueryRepository = new UsersQueryRepository();
  // const emailAdapter = new EmailAdapter();
  // const jwtService = new JwtService();
  // const emailManager = new EmailManager(emailAdapterMock);
  // const usersService = new UsersService();
  // const authService = new AuthService(
  //   jwtService,
  //   emailManager,
  //   usersService,
  //   usersRepository,
  // );

  describe('Create user', () => {
    it('1 – this.emailAdapter.sendEmail should be called', async () => {
      const inputModel = {
        login: 'first login',
        email: 'first-email@.com',
        password: 'qwerty',
      };
      //todo - как здесь тестить,  когда вместо сервиса use case
      // const result = await authService.createUser(inputModel);

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
