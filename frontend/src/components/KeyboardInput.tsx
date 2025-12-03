import React, { FC, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { colors } from '../styles/colors';

interface KeyboardInputProps {
  onSubmit: (text: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  isProcessing: boolean;
}

const KeyboardInput: FC<KeyboardInputProps> = ({ 
  onSubmit, 
  onStartRecording,
  onStopRecording,
  isRecording,
  isProcessing,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [inputHeight, setInputHeight] = useState<number>(40);
  
  // Track start time to prevent accidental short recordings
  const [pressStartTime, setPressStartTime] = useState<number>(0);

  const hasText = inputText.trim().length > 0;

  const handleSend = (): void => {
    if (hasText && !isProcessing) {
      onSubmit(inputText.trim());
      setInputText('');
      setInputHeight(40); 
    }
  };

  const handlePressIn = () => {
    if (!hasText && !isProcessing) {
      setPressStartTime(Date.now());
      onStartRecording();
    }
  };

  const handlePressOut = () => {
    if (!hasText && isRecording) {
      const duration = Date.now() - pressStartTime;
      // If held for less than 500ms, consider it a mistake or too short
      if (duration < 500) {
        console.log('Recording too short, cancelling...');
        // You might want a specific cancel function, but stop works too
        // usually backend/frontend handles empty files, but let's be safe
      }
      onStopRecording();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.textInput, { height: Math.max(40, inputHeight) }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={isRecording ? "Recording..." : "Type a message"}
          placeholderTextColor={colors.text.secondary}
          multiline={true}
          maxLength={1000}
          editable={!isProcessing && !isRecording}
          onContentSizeChange={(e) => {
            setInputHeight(Math.min(e.nativeEvent.contentSize.height, 100));
          }}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton,
          isRecording && styles.actionButtonRecording,
          isProcessing && { backgroundColor: colors.disabled }
        ]}
        onPress={hasText ? handleSend : undefined}
        onPressIn={!hasText ? handlePressIn : undefined}
        onPressOut={!hasText ? handlePressOut : undefined}
        activeOpacity={0.7}
        disabled={isProcessing}
        delayPressIn={0} // Ensure press starts immediately
      >
        <Text style={styles.actionButtonText}>
          {isProcessing ? '⏳' : (hasText ? '➤' : (isRecording ? '🔴' : '🎤'))}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'transparent', 
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 8,
    minHeight: 50,
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textInput: {
    fontSize: 16,
    color: colors.text.dark,
    paddingTop: 8,
    paddingBottom: 8,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  actionButtonRecording: {
    backgroundColor: colors.danger,
    transform: [{ scale: 1.15 }], 
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default KeyboardInput;