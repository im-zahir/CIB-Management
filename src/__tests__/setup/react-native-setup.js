import { NativeModules as RNNativeModules } from 'react-native';
import 'react-native-gesture-handler/jestSetup';

// Mock native modules
RNNativeModules.UIManager = RNNativeModules.UIManager || {};
RNNativeModules.UIManager.RCTView = RNNativeModules.UIManager.RCTView || {};
RNNativeModules.RNGestureHandlerModule = RNNativeModules.RNGestureHandlerModule || {
  State: { BEGAN: 'BEGAN', FAILED: 'FAILED', ACTIVE: 'ACTIVE', END: 'END' },
  attachGestureHandler: jest.fn(),
  createGestureHandler: jest.fn(),
  dropGestureHandler: jest.fn(),
  updateGestureHandler: jest.fn(),
};

RNNativeModules.PlatformConstants = RNNativeModules.PlatformConstants || {
  forceTouchAvailable: false,
  interfaceIdiom: 'phone',
};

// Mock native event emitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock Paper components
jest.mock('react-native-paper', () => {
  const React = require('react');
  const actual = jest.requireActual('react-native-paper');

  return {
    ...actual,
    Provider: ({ children }) => children,
    Portal: {
      Host: ({ children }) => children,
    },
    TextInput: ({ onChangeText, value, ...props }) => (
      React.createElement('TextInput', {
        onChangeText,
        value,
        testID: props.testID,
      })
    ),
    Button: ({ onPress, children, ...props }) => (
      React.createElement('Button', {
        onPress,
        testID: props.testID,
      }, children)
    ),
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
