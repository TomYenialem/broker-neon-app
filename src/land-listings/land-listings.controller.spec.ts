import { Test, TestingModule } from '@nestjs/testing';
import { LandListingsController } from './land-listings.controller';
import { LandListingsService } from './land-listings.service';

describe('LandListingsController', () => {
  let controller: LandListingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LandListingsController],
      providers: [LandListingsService],
    }).compile();

    controller = module.get<LandListingsController>(LandListingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
