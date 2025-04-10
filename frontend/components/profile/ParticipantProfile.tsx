import React, { useRef } from 'react';
import { 
  View, 
  ImageBackground, 
  StyleSheet, 
  Pressable, 
  Text, 
  findNodeHandle, 
  UIManager 
} from 'react-native';
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface ParticipantProfileProps {
  item: {
    memberId: number;
    name: string;
    profileImage: string | null;
    state: string;
  };
  onPress: (name: string, x: number, y: number, width: number, height: number) => void;
  isHost?: boolean;
}

export const ParticipantProfile = ({ item, onPress, isHost = false }: ParticipantProfileProps) => {
  const pressableRef = useRef<React.ElementRef<typeof Pressable>>(null);

  const handlePress = () => {
    const nodeHandle = findNodeHandle(pressableRef.current);
    if (nodeHandle) {
      UIManager.measure(
        nodeHandle,
        (x, y, width, height, pageX, pageY) => {
          onPress(item.name, pageX, pageY, width, height);
        }
      );
    }
  };

  return (
    <Pressable onPress={handlePress} ref={pressableRef} style={styles.outerContainer}>
      <View style={styles.profileImageBox}>
        {item.profileImage ? (
          <ImageBackground source={{ uri: item.profileImage }} style={styles.profileImage}>
            {item.state === 'WAIT' && (
              <>
                <View style={styles.waitingOverlay} />
                <View style={styles.hourglassIconContainer}>
                  <MaterialIcons name="hourglass-empty" size={12} color="white" />
                </View>
              </>
            )}
          </ImageBackground>
        ) : (
          <View style={[styles.profilePlaceholder, item.state === 'WAIT' && styles.waitingPlaceholder]}>
            <Text>{item.name.charAt(0)}</Text>
            {item.state === 'WAIT' && (
              <View style={styles.hourglassIconContainer}>
                <MaterialIcons name="hourglass-empty" size={10} color="white" />
              </View>
            )}
          </View>
        )}
        {isHost && (
          <View style={styles.crownContainer}>
            <FontAwesome6 name="crown" size={10} color="gold" />
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    overflow: 'visible',
    marginVertical: 4,
  },
  profileImageBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  waitingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128,128,128,0.5)',
  },
  hourglassIconContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    padding: 1,
  },
  waitingPlaceholder: {
    backgroundColor: 'rgba(128,128,128,0.5)',
  },
  crownContainer: {
    position: 'absolute',
    top: -1,
    left: 0,
    backgroundColor: Colors.white,
    borderRadius: 6,
    padding: 1,
    elevation: 2,
  },
});
