import { Test, TestingModule } from '@nestjs/testing';
import { UrlsControllerV1 } from './url-shortener.controller';

describe('UrlsController', () => {
  let controller: UrlsControllerV1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlsControllerV1],
    }).compile();

    controller = module.get<UrlsControllerV1>(UrlsControllerV1);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
