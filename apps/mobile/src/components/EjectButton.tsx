import { Alert } from 'react-native';
import { Button } from './primitives/Button';
import { ejectFromEvent } from '@yombri/supabase-client';
import { useAnalytics } from '../hooks/useAnalytics';

interface Props {
  eventId: string;
  userId: string;
  userName: string;
  onEject: () => void;
}

export function EjectButton({ eventId, userId, userName, onEject }: Props) {
  const { trackEvent } = useAnalytics();

  const handleEject = async () => {
    Alert.alert(
      'Eject Attendee',
      `Remove ${userName} from this event? They lose chat access immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Eject',
          style: 'destructive',
          onPress: async () => {
            try {
              await ejectFromEvent(eventId, userId);
              trackEvent('ejection_successful');
              onEject();
            } catch (error) {
              trackEvent('ejection_failed');
              Alert.alert('Ejection failed', 'Check your organizer permissions.');
            }
          }
        }
      ]
    );
  };

  return (
    <Button variant="destructive" size="sm" onPress={handleEject}>
      Red Card
    </Button>
  );
}
