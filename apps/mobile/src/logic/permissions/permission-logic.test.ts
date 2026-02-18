import { decidePermissionFlow, PermissionState } from './permission-logic';

describe('decidePermissionFlow', () => {
  const base: PermissionState = {
    status: 'undetermined',
    canAskAgain: true,
    os: 'ios',
  };

  it('requests on first ask (undetermined)', () => {
    const result = decidePermissionFlow(base);
    expect(result).toEqual({ action: 'request' });
  });

  it('shows rationale if denied once but can ask again', () => {
    const result = decidePermissionFlow({
      ...base,
      status: 'denied',
      canAskAgain: true,
    });
    expect(result).toEqual({ action: 'explain_rationale' });
  });

  it('opens settings if permanently denied', () => {
    const result = decidePermissionFlow({
      ...base,
      status: 'denied',
      canAskAgain: false,
    });
    expect(result).toEqual({ action: 'open_settings' });
  });

  it('no-op when already granted', () => {
    const result = decidePermissionFlow({
      ...base,
      status: 'granted',
    });
    expect(result).toEqual({ action: 'noop' });
  });

  it('handles OS mismatch defensively', () => {
    const result = decidePermissionFlow({
      ...base,
      os: 'windows' as any,
    });
    expect(result).toEqual({ action: 'unsupported_os' });
  });
});
