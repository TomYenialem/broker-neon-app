import { Test, TestingModule } from '@nestjs/testing';
import { LandListingsService } from './land-listings.service';

describe('LandListingsService', () => {
  let service: LandListingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LandListingsService],
    }).compile();

    service = module.get<LandListingsService>(LandListingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
