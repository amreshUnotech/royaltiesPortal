import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

interface INotification {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}
const NotificationDialog: React.FC<INotification> = ({
  visible,
  onClose,
  title,
  message,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.flexFill} onPress={onClose} />

        <View style={styles.dialog}>
          <Image
            source={require('../assets/info-outlined.png')}
            resizeMode="contain"
            style={styles.image}
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onClose}
            style={styles.gradientWrapper}
          >
            <LinearGradient
              colors={['#1D41FF', '#8F00FF']}
              start={{ x: 0.1, y: 0.0 }}
              end={{ x: 0.9, y: 1.0 }}
              style={styles.gradient}
            >
              <Text style={styles.primaryText}>OK</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  flexFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialog: {
    width: Math.min(width - 40, 420),
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
  },
  image: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
    textAlign: 'left',
  },
  message: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 48,
  },
  gradientWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
  },
  gradient: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
  },
});

export default NotificationDialog;
