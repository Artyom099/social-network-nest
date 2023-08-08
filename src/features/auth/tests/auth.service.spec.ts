import { AuthService } from '../application/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/application/users.service';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('AuthService – integration test', () => {
  let mongoServer: MongoMemoryServer;
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  const emailAdapterMock: jest.Mocked<EmailAdapter> = {
    seneEmail: jest.fn(),
  };

  const usersRepository = new UsersRepository();
  const usersQueryRepository = new UsersQueryRepository();

  const jwtService = new JwtService();
  const usersService = new UsersService(usersRepository);
  const authService = new AuthService(
    jwtService,
    usersService,
    usersRepository,
    usersQueryRepository,
  );

  describe('Create user', () => {
    it('return', async () => {
      expect(5).toBe(5);
    });
  });
});
