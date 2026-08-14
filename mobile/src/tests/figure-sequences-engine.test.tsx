import { render } from '@testing-library/react-native';

import { generateFigureSequenceQuestion } from '@/features/practice/figure-sequences/generator';
import { FigureRenderer } from '@/features/practice/figure-sequences/figure-renderer';
import {
  applyTransformation,
  replaySequence,
} from '@/features/practice/figure-sequences/transformations';
import { validateFigureSequenceQuestion } from '@/features/practice/figure-sequences/validator';
import type {
  Figure,
  FigureMatrix,
} from '@/features/practice/figure-sequences/model';

function matrixAt(x: number, y: number): FigureMatrix {
  const figure: Figure = {
    shape: 'square',
    position: { x, y },
    rotation: 0,
    fill: 'solid',
    size: 20,
    color: 'green',
  };
  return {
    rows: 3,
    columns: 3,
    cells: Array.from({ length: 3 }, (_, row) =>
      Array.from({ length: 3 }, (_, column) => ({
        figures: row === y && column === x ? [figure] : [],
      })),
    ),
  };
}

describe('Figure Sequences V2 engine', () => {
  it.each(['low', 'medium', 'high'] as const)(
    'generates valid %s questions',
    (difficulty) => {
      const question = generateFigureSequenceQuestion({
        seed: 2026,
        difficulty,
      });
      expect(validateFigureSequenceQuestion(question)).toEqual({
        valid: true,
        errors: [],
      });
      expect(question.sequence).toHaveLength(5);
      expect(question.targets).toHaveLength(2);
      expect(question.options).toHaveLength(4);
    },
  );

  it('is deterministic for seed, difficulty, and generator version', () => {
    const first = generateFigureSequenceQuestion({
      seed: 482913,
      difficulty: 'medium',
    });
    expect(first).toEqual(
      generateFigureSequenceQuestion({ seed: 482913, difficulty: 'medium' }),
    );
    expect(first.generatorVersion).toBe('figure-sequence-v2');
    expect(first).not.toEqual(
      generateFigureSequenceQuestion({ seed: 482914, difficulty: 'medium' }),
    );
  });

  it('generates exactly one correct pair and unique distractors', () => {
    const question = generateFigureSequenceQuestion({
      seed: 99,
      difficulty: 'high',
    });
    const correct = question.options.filter(
      (option) => option.id === question.correctOptionId,
    );
    expect(correct).toHaveLength(1);
    expect(question.options.map((option) => option.id)).toHaveLength(
      new Set(question.options.map((option) => option.id)).size,
    );
    expect(
      question.options.filter(
        (option) =>
          JSON.stringify(option.first) ===
            JSON.stringify(question.targets[0]) &&
          JSON.stringify(option.second) === JSON.stringify(question.targets[1]),
      ),
    ).toHaveLength(1);
  });

  it('supports movement, increasing steps, alternating directions, and boundaries', () => {
    const moved = applyTransformation(
      matrixAt(0, 1),
      {
        type: 'move',
        id: 'right',
        direction: 'right',
        step: 1,
        boundary: 'bounce',
      },
      0,
    );
    expect(moved.cells[1][1].figures).toHaveLength(1);
    const increasing = replaySequence(
      matrixAt(0, 1),
      [
        {
          type: 'move',
          id: 'increasing',
          direction: 'right',
          step: 1,
          stepIncrement: 2,
          boundary: 'bounce',
        },
      ],
      2,
    );
    expect(increasing[1].cells[1][1].figures).toHaveLength(1);
    expect(increasing[2].cells[1][0].figures).toHaveLength(1);
    const bounced = applyTransformation(
      matrixAt(2, 1),
      {
        type: 'move',
        id: 'bounce',
        direction: 'right',
        step: 1,
        boundary: 'bounce',
      },
      0,
    );
    expect(bounced.cells[1][1].figures).toHaveLength(1);
    const followed = applyTransformation(
      matrixAt(0, 0),
      {
        type: 'move',
        id: 'follow',
        direction: 'right',
        step: 1,
        boundary: 'boundary-follow',
      },
      0,
    );
    expect(followed.cells[0][1].figures).toHaveLength(1);
    const alternating = replaySequence(
      matrixAt(0, 1),
      [
        {
          type: 'move',
          id: 'alternating',
          direction: ['right', 'left'],
          step: 1,
          boundary: 'bounce',
        },
      ],
      3,
    );
    expect(
      alternating.every((matrix) =>
        matrix.cells
          .flat()
          .flatMap((cell) => cell.figures)
          .every((figure) => figure.position.x >= 0 && figure.position.x <= 2),
      ),
    ).toBe(true);
  });

  it('supports rotation changes and cyclic colour changes as explicit state', () => {
    const rotated = applyTransformation(
      matrixAt(1, 1),
      { type: 'rotate', id: 'rotate', increment: 90 },
      0,
    );
    expect(rotated.cells[1][1].figures[0].rotation).toBe(90);
    const colored = replaySequence(
      matrixAt(1, 1),
      [{ type: 'color', id: 'colors', colors: ['green', 'purple', 'yellow'] }],
      2,
    );
    expect(
      colored.map((matrix) => matrix.cells[1][1].figures[0]?.color),
    ).toEqual(['green', 'green', 'purple']);

    const independent = applyTransformation(
      {
        ...matrixAt(0, 0),
        cells: matrixAt(0, 0).cells.map((row, y) =>
          row.map((cell, x) =>
            x === 0 && y === 0
              ? cell
              : x === 1 && y === 1
                ? {
                    figures: [
                      {
                        ...matrixAt(0, 0).cells[0][0].figures[0],
                        position: { x: 1, y: 1 },
                      },
                    ],
                  }
                : cell,
          ),
        ),
      },
      {
        type: 'per-figure',
        id: 'independent-rotation',
        figureIndex: 1,
        transformation: { type: 'rotate', id: 'rotate-one', increment: 90 },
      },
      0,
    );
    expect(independent.cells[1][1].figures[0].rotation).toBe(90);
    expect(independent.cells[0][0].figures[0].rotation).toBe(0);
  });

  it('keeps generated figures in bounds without unintended overlap', () => {
    for (const difficulty of ['low', 'medium', 'high'] as const) {
      for (let seed = 0; seed < 100; seed += 1) {
        const question = generateFigureSequenceQuestion({ seed, difficulty });
        expect(validateFigureSequenceQuestion(question).valid).toBe(true);
      }
    }
  });

  it('detects malformed matrices and incorrect target pairs', () => {
    const question = generateFigureSequenceQuestion({
      seed: 123,
      difficulty: 'medium',
    });
    const malformed = JSON.parse(JSON.stringify(question)) as typeof question;
    const firstFigure = malformed.sequence[0].cells.flatMap((row) =>
      row.flatMap((cell) => cell.figures),
    )[0];
    firstFigure.position.x = 9;
    expect(validateFigureSequenceQuestion(malformed).valid).toBe(false);
    const wrongTargets = JSON.parse(
      JSON.stringify(question),
    ) as typeof question;
    wrongTargets.targets[0] = wrongTargets.sequence[0];
    expect(validateFigureSequenceQuestion(wrongTargets).valid).toBe(false);
    const missingMetadata = JSON.parse(
      JSON.stringify(question),
    ) as typeof question;
    missingMetadata.ruleMetadata = undefined as never;
    expect(validateFigureSequenceQuestion(missingMetadata).valid).toBe(false);
  });

  it('renders a generated figure from the matrix model', async () => {
    const question = generateFigureSequenceQuestion({
      seed: 123,
      difficulty: 'low',
    });
    const figure = question.sequence[0].cells.flatMap((row) =>
      row.flatMap((cell) => cell.figures),
    )[0];
    const view = await render(<FigureRenderer figure={figure} />);
    expect(view.toJSON()).toBeTruthy();
  });
});
