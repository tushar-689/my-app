import type { Difficulty } from '@/domain/questions/types';

export type FigureShape =
  'circle' | 'square' | 'triangle' | 'diamond' | 'arrow';
export type FigureFill = 'outline' | 'solid';
export type FigureColor = 'ink' | 'green' | 'purple' | 'yellow';

export type Figure = {
  shape: FigureShape;
  position: { x: number; y: number };
  rotation: 0 | 90 | 180 | 270;
  fill: FigureFill;
  size: number;
  color: FigureColor;
};

export type MatrixCell = { figures: Figure[] };

export type FigureMatrix = {
  rows: 3;
  columns: 3;
  cells: MatrixCell[][];
};

export type Direction =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'up-left'
  | 'up-right'
  | 'down-left'
  | 'down-right';

export type BoundaryBehavior = 'bounce' | 'boundary-follow';

export type TransformationSpec =
  | {
      type: 'move';
      id: string;
      direction: Direction | Direction[];
      step: number;
      stepIncrement?: number;
      boundary: BoundaryBehavior;
    }
  | {
      type: 'rotate';
      id: string;
      increment: 90 | 180 | 270;
      incrementStep?: 90 | 180 | 270;
    }
  | {
      type: 'color';
      id: string;
      colors: FigureColor[];
    }
  | {
      type: 'per-figure';
      id: string;
      figureIndex: number;
      transformation: Exclude<TransformationSpec, { type: 'per-figure' }>;
    }
  | {
      type: 'combined';
      id: string;
      transformations: TransformationSpec[];
    };

export type FigureSequenceRuleMetadata = {
  transformations: TransformationSpec[];
};

export type FigureSequenceOption = {
  id: string;
  first: FigureMatrix;
  second: FigureMatrix;
  distractorType?: string;
};

export type FigureSequenceQuestionV2 = {
  id: string;
  taskType: 'figure-sequences';
  module: 'core';
  difficulty: Difficulty;
  generatorVersion: 'figure-sequence-v2';
  seed: number;
  sequence: FigureMatrix[];
  targets: [FigureMatrix, FigureMatrix];
  options: FigureSequenceOption[];
  correctOptionId: string;
  initialMatrix: FigureMatrix;
  ruleMetadata: FigureSequenceRuleMetadata;
  complexityScore: number;
  skillTags: string[];
};

export type FigureSequenceQuestion = FigureSequenceQuestionV2;
