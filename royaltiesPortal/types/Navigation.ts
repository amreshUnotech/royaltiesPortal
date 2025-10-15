import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Url: { url: string };
};

export type UrlScreenProps = NativeStackScreenProps<RootStackParamList, 'Url'>;
