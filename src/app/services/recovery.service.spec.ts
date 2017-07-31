import { TestBed, inject } from '@angular/core/testing';

import { RecoveryService } from './recovery.service';

describe('RecoveryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecoveryService]
    });
  });

  it('should be created', inject([RecoveryService], (service: RecoveryService) => {
    expect(service).toBeTruthy();
  }));
});
