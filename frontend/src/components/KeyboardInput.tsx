import React, { FC, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Keyboard,
} from 'react-native';
import { colors } from '../styles/colors';

interface KeyboardInputProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
  compact?: boolean; // For side-by-side layout
}

interface Styles {
  container: ViewStyle;
  inputContainer: ViewStyle;
  textInput: TextStyle;
  sendButton: ViewStyle;
  sendButtonDisabled: ViewStyle;
  sendButtonText: TextStyle;
  compactInput: TextStyle;
}

const KeyboardInput: FC<KeyboardInputProps> = ({ 
  onSubmit, 
  isProcessing,
  compact = false 
}) => {
  const [inputText, setInputText] = useState<string>('');

  const handleSend = (): void => {
    if (inputText.trim() && !isProcessing) {
      onSubmit(inputText.trim());
      setInputText('');
      Keyboard.dismiss();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.textInput, compact && styles.compactInput]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor={colors.text.secondary}
          multiline={!compact}
          maxLength={500}
          editable={!isProcessing}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isProcessing) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isProcessing}
          activeOpacity={0.7}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingLeft: 15,
    paddingRight: 5,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.button,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.dark,
    maxHeight: 100,
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  compactInput: {
    maxHeight: 40,
    minHeight: 40,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default KeyboardInput;