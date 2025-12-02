import React, { FC, useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Keyboard,
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

interface Styles {
  container: ViewStyle;
  inputWrapper: ViewStyle;
  textInput: TextStyle;
  actionButton: ViewStyle;
  actionButtonRecording: ViewStyle;
  actionButtonText: TextStyle;
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
  const inputRef = useRef<TextInput>(null);


  const hasText = inputText.trim().length > 0;

  const handleSend = (): void => {
    if (hasText && !isProcessing) {
      onSubmit(inputText.trim());
      setInputText('');
      setInputHeight(2); 
      
      // Keyboard.dismiss(); 
    }
  };

  const handleContentSizeChange = (event: any) => {
    const height = event.nativeEvent.contentSize.height;
    setInputHeight(Math.min(Math.max(40, height), 100));
  };

  return (
    <View style={styles.container}>

      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef}
          style={[styles.textInput, { height: inputHeight }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={isRecording ? "Recording..." : "Type a message..."}
          placeholderTextColor={colors.text.secondary}
          multiline={true}
          maxLength={500}
          editable={!isProcessing && !isRecording}
          returnKeyType="default"
          onContentSizeChange={handleContentSizeChange}
          scrollEnabled={inputHeight > 80}
        />
      </View>


      <TouchableOpacity
        style={[
          styles.actionButton,
          isRecording && styles.actionButtonRecording, 
          isProcessing && { backgroundColor: colors.disabled }
        ]}
       
        onPress={hasText ? handleSend : undefined}
        onPressIn={!hasText ? onStartRecording : undefined}
        onPressOut={!hasText ? onStopRecording : undefined}
        activeOpacity={0.7}
        disabled={isProcessing}
      >
        <Text style={styles.actionButtonText}>

          {isProcessing ? '⏳' : (hasText ? '➤' : (isRecording ? '🔴' : '🎤'))}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    width: '100%',
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'transparent', 
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  inputWrapper: {
    flex: 1, 
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 10, 
    minHeight: 50,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  textInput: {
    fontSize: 16,
    color: colors.text.dark,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 100,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary, 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginBottom: 0, 
  },
  actionButtonRecording: {
    backgroundColor: colors.danger, 
    transform: [{ scale: 1.1 }] 
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default KeyboardInput;

