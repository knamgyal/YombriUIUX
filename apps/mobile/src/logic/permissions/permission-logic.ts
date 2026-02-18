export type PermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface PermissionState {
  status: PermissionStatus;
  canAskAgain: boolean;
  os: 'ios' | 'android';
}

export type PermissionDecision =
  | { action: 'request' }                      // call requestPermission()
  | { action: 'explain_rationale' }           // show rationale UI then request
  | { action: 'open_settings' }               // permanent denial
  | { action: 'noop' }                        // already granted
  | { action: 'unsupported_os' };             // mis-detected OS

export function decidePermissionFlow(
  state: PermissionState,
): PermissionDecision {
  if (state.os !== 'ios' && state.os !== 'android') {
    return { action: 'unsupported_os' };
  }

  if (state.status === 'granted') {
    return { action: 'noop' };
  }

  if (state.status === 'undetermined') {
    return { action: 'request' };
  }

  // status === 'denied'
  if (state.canAskAgain) {
    return { action: 'explain_rationale' };
  }

  return { action: 'open_settings' };
}
