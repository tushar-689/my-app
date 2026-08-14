import type {
  Direction,
  Figure,
  FigureColor,
  FigureMatrix,
  TransformationSpec,
} from './model';

const directions: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  'up-left': { x: -1, y: -1 },
  'up-right': { x: 1, y: -1 },
  'down-left': { x: -1, y: 1 },
  'down-right': { x: 1, y: 1 },
};

function cloneMatrix(matrix: FigureMatrix): FigureMatrix {
  return {
    rows: 3,
    columns: 3,
    cells: matrix.cells.map((row) =>
      row.map((cell) => ({
        figures: cell.figures.map((figure) => ({
          ...figure,
          position: { ...figure.position },
        })),
      })),
    ),
  };
}

function figures(matrix: FigureMatrix): Figure[] {
  return matrix.cells.flatMap((row) => row.flatMap((cell) => cell.figures));
}

function matrixWithFigures(
  source: FigureMatrix,
  nextFigures: Figure[],
): FigureMatrix {
  const cells = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => ({ figures: [] as Figure[] })),
  );
  nextFigures.forEach((figure) =>
    cells[figure.position.y][figure.position.x].figures.push(figure),
  );
  return { rows: 3, columns: 3, cells };
}

function reflect(value: number, max: number): number {
  if (max <= 0) return 0;
  const period = max * 2;
  const normalized = ((value % period) + period) % period;
  return normalized <= max ? normalized : period - normalized;
}

function perimeterPosition(
  position: { x: number; y: number },
  step: number,
): { x: number; y: number } {
  const path = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
    { x: 0, y: 2 },
    { x: 0, y: 1 },
  ];
  const current = path.findIndex(
    (point) => point.x === position.x && point.y === position.y,
  );
  const index = current < 0 ? 0 : current;
  return path[(index + step) % path.length];
}

function applyMove(
  matrix: FigureMatrix,
  spec: Extract<TransformationSpec, { type: 'move' }>,
  stepIndex: number,
): FigureMatrix {
  const nextFigures = figures(matrix).map((figure) => {
    const direction = Array.isArray(spec.direction)
      ? spec.direction[stepIndex % spec.direction.length]
      : spec.direction;
    const vector = directions[direction];
    const amount = spec.step + (spec.stepIncrement ?? 0) * stepIndex;
    const position =
      spec.boundary === 'boundary-follow'
        ? perimeterPosition(figure.position, amount)
        : {
            x: reflect(figure.position.x + vector.x * amount, 2),
            y: reflect(figure.position.y + vector.y * amount, 2),
          };
    return { ...figure, position };
  });
  return matrixWithFigures(matrix, nextFigures);
}

function applyRotate(
  matrix: FigureMatrix,
  spec: Extract<TransformationSpec, { type: 'rotate' }>,
  stepIndex: number,
): FigureMatrix {
  const increment = spec.increment + (spec.incrementStep ?? 0) * stepIndex;
  return matrixWithFigures(
    matrix,
    figures(matrix).map((figure) => ({
      ...figure,
      rotation: ((figure.rotation + increment) % 360) as Figure['rotation'],
    })),
  );
}

function applyColor(
  matrix: FigureMatrix,
  spec: Extract<TransformationSpec, { type: 'color' }>,
  stepIndex: number,
): FigureMatrix {
  return matrixWithFigures(
    matrix,
    figures(matrix).map((figure, index) => ({
      ...figure,
      color: spec.colors[
        (stepIndex + index) % spec.colors.length
      ] as FigureColor,
    })),
  );
}

function applyPerFigure(
  matrix: FigureMatrix,
  spec: Extract<TransformationSpec, { type: 'per-figure' }>,
  stepIndex: number,
): FigureMatrix {
  const nextFigures = figures(matrix).map((figure) => ({
    ...figure,
    position: { ...figure.position },
  }));
  const target = nextFigures[spec.figureIndex];
  if (!target) return cloneMatrix(matrix);
  const isolated = matrixWithFigures(matrix, [target]);
  const transformed = applyTransformation(
    isolated,
    spec.transformation,
    stepIndex,
  );
  const transformedFigure = figures(transformed)[0];
  if (!transformedFigure) return cloneMatrix(matrix);
  nextFigures[spec.figureIndex] = transformedFigure;
  return matrixWithFigures(matrix, nextFigures);
}

export function applyTransformation(
  matrix: FigureMatrix,
  spec: TransformationSpec,
  stepIndex: number,
): FigureMatrix {
  if (spec.type === 'move') return applyMove(matrix, spec, stepIndex);
  if (spec.type === 'rotate') return applyRotate(matrix, spec, stepIndex);
  if (spec.type === 'color') return applyColor(matrix, spec, stepIndex);
  if (spec.type === 'per-figure')
    return applyPerFigure(matrix, spec, stepIndex);
  return spec.transformations.reduce(
    (current, transformation) =>
      applyTransformation(current, transformation, stepIndex),
    cloneMatrix(matrix),
  );
}

export function applyTransformations(
  matrix: FigureMatrix,
  transformations: TransformationSpec[],
  stepIndex: number,
): FigureMatrix {
  return transformations.reduce(
    (current, transformation) =>
      applyTransformation(current, transformation, stepIndex),
    cloneMatrix(matrix),
  );
}

export function replaySequence(
  initial: FigureMatrix,
  transformations: TransformationSpec[],
  count: number,
): FigureMatrix[] {
  const sequence = [cloneMatrix(initial)];
  for (let step = 0; step < count; step += 1) {
    sequence.push(
      applyTransformations(
        sequence[sequence.length - 1],
        transformations,
        step,
      ),
    );
  }
  return sequence;
}
