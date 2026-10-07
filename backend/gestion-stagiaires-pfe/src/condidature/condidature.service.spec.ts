import { Test, TestingModule } from '@nestjs/testing';
import { CondidatureService } from './condidature.service';

describe('CondidatureService', () => {
  let service: CondidatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CondidatureService],
    }).compile();

    service = module.get<CondidatureService>(CondidatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
