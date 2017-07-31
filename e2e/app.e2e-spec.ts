import { CopayRecoveryPage } from './app.po';

describe('copay-recovery App', () => {
  let page: CopayRecoveryPage;

  beforeEach(() => {
    page = new CopayRecoveryPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
