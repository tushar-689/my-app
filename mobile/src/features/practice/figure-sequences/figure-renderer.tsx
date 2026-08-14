import Svg, { Circle, G, Line, Polygon, Rect } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';
import type { Figure } from './model';

export function FigureRenderer({
  figure,
  size = 72,
}: {
  figure: Figure;
  size?: number;
}) {
  const theme = useTheme();
  const center = size / 2;
  const scale = figure.size / 28;
  const color = theme[figure.color];
  const stroke = theme.border;
  const common = {
    fill: figure.fill === 'solid' ? color : 'transparent',
    stroke,
    strokeWidth: 2.5,
  };
  const points = `${center},${center - 18 * scale} ${center + 18 * scale},${center + 15 * scale} ${center - 18 * scale},${center + 15 * scale}`;
  return (
    <Svg
      accessibilityLabel={`${figure.shape} figure`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <G
        rotation={figure.rotation}
        origin={`${center}, ${center}`}
        translateX={(figure.position.x - 1) * 8}
        translateY={(figure.position.y - 1) * 8}
      >
        {figure.shape === 'circle' && (
          <Circle cx={center} cy={center} r={18 * scale} {...common} />
        )}
        {figure.shape === 'square' && (
          <Rect
            x={center - 18 * scale}
            y={center - 18 * scale}
            width={36 * scale}
            height={36 * scale}
            rx={4}
            {...common}
          />
        )}
        {figure.shape === 'triangle' && <Polygon points={points} {...common} />}
        {figure.shape === 'diamond' && (
          <Polygon
            points={`${center},${center - 22 * scale} ${center + 22 * scale},${center} ${center},${center + 22 * scale} ${center - 22 * scale},${center}`}
            {...common}
          />
        )}
        {figure.shape === 'arrow' && (
          <>
            <Line
              x1={center - 20 * scale}
              y1={center}
              x2={center + 20 * scale}
              y2={center}
              stroke={stroke}
              strokeWidth={5}
            />
            <Polygon
              points={`${center + 20 * scale},${center} ${center + 6 * scale},${center - 12 * scale} ${center + 6 * scale},${center + 12 * scale}`}
              fill={color}
              stroke={stroke}
              strokeWidth={2}
            />
          </>
        )}
      </G>
    </Svg>
  );
}
