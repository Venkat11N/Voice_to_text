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
  isProcessing: boolean;
  compact?: boolean;
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
  const [inputHeight, setInputHeight] = useState<number>(40);
  const inputRef = useRef<TextInput>(null);

  const handleSend = (): void => {
    if (inputText.trim() && !isProcessing) {
      onSubmit(inputText.trim());
      setInputText('');
      setInputHeight(5);
      Keyboard.dismiss();
    }
  };

  const handleContentSizeChange = (event: any) => {
    const height = event.nativeEvent.contentSize.height;
    // Limit max height to 120
    setInputHeight(Math.min(Math.max(40, height), 120));
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            { height: inputHeight },
            compact && styles.compactInput
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor={colors.text.secondary}
          multiline={!compact}
          maxLength={500}
          editable={!isProcessing}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          blurOnSubmit={true}
          onContentSizeChange={handleContentSizeChange}
          scrollEnabled={inputHeight > 80}
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
    alignItems: 'flex-end',
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingLeft: 15,
    paddingRight: 5,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.button,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.dark,
    minHeight: 40,
    paddingVertical: Platform.OS === 'ios' ? 10 : 5,
    paddingHorizontal: 5,
    paddingRight: 10,
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
    marginBottom: 5,
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