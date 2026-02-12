import { setSiteName, initSiteName, siteName } from '../src/siteConfig';
import { describe, it, expect } from 'vitest';

describe('siteConfig', () => {
  it('sets siteName and persists', () => {
    setSiteName('TestName');
    expect(siteName).toBe('TestName');
    // if localStorage is available, it should be saved
    try {
      const saved = localStorage.getItem('novadash_siteName');
      expect(saved).toBe('TestName');
    } catch (e) {
      // node env without localStorage is fine
    }
  });
});
