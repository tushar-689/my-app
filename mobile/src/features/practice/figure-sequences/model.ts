export type FigureShape =
  'circle' | 'square' | 'triangle' | 'diamond' | 'arrow';
export type FigureFill = 'outline' | 'solid';
export type FigureColor = 'ink' | 'green' | 'purple' | 'yellow';

export type Figure = {
  shape: FigureShape;
  position: { x: number; y: number };
  rotation: number;
  fill: FigureFill;
  size: number;
  color: FigureColor;
};

export type FigureSequenceRule =
  | 'rotation'
  | 'horizontal'
  | 'vertical'
  | 'alternating'
  | 'shape'
  | 'fill'
  | 'size';

export type FigureSequenceQuestion = {
  seed: number;
  difficulty: 1 | 2 | 3;
  rule: FigureSequenceRule;
  sequence: Figure[];
  answerOptions: Figure[];
  correctAnswer: number;
};
