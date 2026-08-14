import LottieView from 'lottie-react-native';
import celebration from '../../assets/lottie/celebration.json';

export function AppLottie({ size = 120 }: { size?: number }) {
  return (
    <LottieView
      autoPlay
      loop={false}
      source={celebration}
      style={{ width: size, height: size }}
    />
  );
}
