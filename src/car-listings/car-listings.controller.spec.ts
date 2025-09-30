import { Test, TestingModule } from '@nestjs/testing';
import { CarListingsController } from './car-listings.controller';
import { CarListingsService } from './car-listings.service';

describe('CarListingsController', () => {
  let controller: CarListingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarListingsController],
      providers: [CarListingsService],
    }).compile();

    controller = module.get<CarListingsController>(CarListingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
