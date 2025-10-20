import { Test, TestingModule } from '@nestjs/testing';
import { CarListingsService } from './car-listings.service';

describe('CarListingsService', () => {
  let service: CarListingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarListingsService],
    }).compile();

    service =  module.get<CarListingsService>(CarListingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
