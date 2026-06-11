import { TestBed } from '@angular/core/testing';

import { GridDataService } from './grid-data.service';

describe('GridDataService', () => {
  let service: GridDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
