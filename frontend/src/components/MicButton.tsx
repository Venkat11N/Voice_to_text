import React,{FC} from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent
} from 'react-native';
import { colors } from '../styles/colors';
import { MicButtonProps } from '../types';

interface Style {
  micButton: ViewStyle;
  micButtonRecording: ViewStyle;
  micButtonDisabled: ViewStyle;
  micIcon: TextStyle;
}

const MicButton: FC <MicButtonProps> = ({
  isRecording,
  isProcessing,
  onPressIn,
  onPressOut
}: MicButtonProps) => {
  const handlePressIn = (event :GestureResponderEvent): void => {
    onPressIn();
  }

const handlePressOut = ( event :GestureResponderEvent): void => {
  onPressOut();
};

  return (
    <TouchableOpacity
      style={[
        styles.micButton,
        isRecording && styles.micButtonRecording,
        isProcessing && styles.micButtonDisabled,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isProcessing}
      activeOpacity={0.8}
    >
      <Text style={styles.micIcon}>
        {isRecording ? '🔴' : '🎤'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create<Styles>({
  micButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity:0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  micButtonRecording: {
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
    trasnform: [{ scale: 1.1}],
  },
  micButtonDisabled: {
    backgroundColor: colors.disabled,
    shadowColor:colors.disabled,
  },
  micIcon: {
    fontSize: 50,
  },
});

export default MicButton;
