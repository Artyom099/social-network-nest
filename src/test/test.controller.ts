import { Controller, Delete } from '@nestjs/common';
import { TestRepository } from './test.repository';

@Controller('testing/all-data')
export class TestController {
  constructor(protected testRepository: TestRepository) {}
  @Delete()
  async deleteAllData() {
    await this.testRepository.deleteAllData();
  }
}
