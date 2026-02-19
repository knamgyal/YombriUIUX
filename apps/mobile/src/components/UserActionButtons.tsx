import { View } from 'react-native';
import { Button } from './primitives/Button';
import { 
  followUser, 
  unfollowUser, 
  blockUser 
} from '@yombri/supabase-client';
import { useState } from 'react';

interface Props {
  userId: string;
  isFollowing: boolean;
  onFollowChange: (following: boolean) => void;
}

export function UserActionButtons({ userId, isFollowing, onFollowChange }: Props) {
  const [blocking, setBlocking] = useState(false);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      onFollowChange(!isFollowing);
    } catch (error) {
      console.error('Follow failed:', error);
    }
  };

  const handleBlock = async () => {
    if (blocking) return;
    setBlocking(true);
    try {
      await blockUser(userId);
    } catch (error) {
      console.error('Block failed:', error);
    } finally {
      setBlocking(false);
    }
  };

  return (
    <View className="flex-row gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onPress={handleFollow}
      >
        {isFollowing ? 'Unfollow' : 'Follow'}
      </Button>
      <Button 
        variant="destructive" 
        size="sm"
        onPress={handleBlock}
        disabled={blocking}
      >
        {blocking ? 'Blocking...' : 'Block'}
      </Button>
    </View>
  );
}
