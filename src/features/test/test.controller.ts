import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TestRepository } from './test.repository';

@Controller('testing/all-data')
export class TestController {
  constructor(private testRepository: TestRepository) {}

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    await this.testRepository.deleteAllData();
  }
}
