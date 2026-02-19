import { canShowEjectButton } from '../utils/social';

describe('Ejection UI Gating (Pure Logic)', () => {
  test('organizer can see eject for other user', () => {
    expect(
      canShowEjectButton({
        isOrganizer: true,
        organizerId: 'organizer-1',
        currentUserId: 'organizer-1',
        targetUserId: 'participant-1',
      })
    ).toBe(true);
  });

  test('organizer cannot eject self', () => {
    expect(
      canShowEjectButton({
        isOrganizer: true,
        organizerId: 'organizer-1',
        currentUserId: 'organizer-1',
        targetUserId: 'organizer-1',
      })
    ).toBe(false);
  });

  test('participant cannot see eject', () => {
    expect(
      canShowEjectButton({
        isOrganizer: false,
        organizerId: 'organizer-1',
        currentUserId: 'participant-1',
        targetUserId: 'other',
      })
    ).toBe(false);
  });

  test('non-organizer cannot see eject even if isOrganizer flag is wrong', () => {
    expect(
      canShowEjectButton({
        isOrganizer: true,
        organizerId: 'organizer-1',
        currentUserId: 'someone-else',
        targetUserId: 'participant-1',
      })
    ).toBe(false);
  });
});
