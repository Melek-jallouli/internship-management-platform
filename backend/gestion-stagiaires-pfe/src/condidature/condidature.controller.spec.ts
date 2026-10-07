import { Test, TestingModule } from '@nestjs/testing';
import { CondidatureController } from './condidature.controller';

describe('CondidatureController', () => {
  let controller: CondidatureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CondidatureController],
    }).compile();

    controller = module.get<CondidatureController>(CondidatureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
