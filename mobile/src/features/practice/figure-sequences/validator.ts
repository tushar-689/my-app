import { replaySequence } from './transformations';
import type { FigureMatrix, FigureSequenceQuestionV2 } from './model';

export type FigureSequenceValidationResult = {
  valid: boolean;
  errors: string[];
};

function matrixKey(matrix: FigureMatrix): string {
  return JSON.stringify(matrix);
}

function matrixErrors(matrix: FigureMatrix, label: string): string[] {
  const errors: string[] = [];
  if (
    !matrix ||
    !Array.isArray(matrix.cells) ||
    matrix.rows !== 3 ||
    matrix.columns !== 3 ||
    matrix.cells.length !== 3 ||
    matrix.cells.some((row) => row.length !== 3)
  ) {
    errors.push(`${label} must be a 3x3 matrix`);
    return errors;
  }
  const positions = new Set<string>();
  matrix.cells.forEach((row) =>
    row.forEach((cell) =>
      cell.figures.forEach((figure) => {
        const position = `${figure.position.x}:${figure.position.y}`;
        if (
          figure.position.x < 0 ||
          figure.position.x > 2 ||
          figure.position.y < 0 ||
          figure.position.y > 2
        )
          errors.push(`${label} contains an out-of-bounds figure`);
        if (positions.has(position))
          errors.push(`${label} contains overlapping figures`);
        positions.add(position);
        if (![0, 90, 180, 270].includes(figure.rotation))
          errors.push(`${label} contains an invalid orientation`);
        if (
          !['circle', 'square', 'triangle', 'diamond', 'arrow'].includes(
            figure.shape,
          )
        )
          errors.push(`${label} contains an invalid shape`);
        if (!['ink', 'green', 'purple', 'yellow'].includes(figure.color))
          errors.push(`${label} contains an invalid color`);
      }),
    ),
  );
  return errors;
}

function targetMatches(
  option: { first: FigureMatrix; second: FigureMatrix },
  targets: [FigureMatrix, FigureMatrix],
): boolean {
  return (
    matrixKey(option.first) === matrixKey(targets[0]) &&
    matrixKey(option.second) === matrixKey(targets[1])
  );
}

export function validateFigureSequenceQuestion(
  question: FigureSequenceQuestionV2,
): FigureSequenceValidationResult {
  const errors: string[] = [];
  if (
    !question ||
    !Array.isArray(question.sequence) ||
    !Array.isArray(question.options)
  )
    return { valid: false, errors: ['question structure is invalid'] };
  if (
    !question.id ||
    question.taskType !== 'figure-sequences' ||
    question.module !== 'core'
  )
    errors.push('missing Figure Sequence identity');
  if (question.generatorVersion !== 'figure-sequence-v2')
    errors.push('missing generator metadata');
  if (!question.seed && question.seed !== 0) errors.push('missing seed');
  if (question.sequence.length < 5)
    errors.push('at least five observed matrices are required');
  question.sequence.forEach((matrix, index) =>
    errors.push(...matrixErrors(matrix, `sequence[${index}]`)),
  );
  question.targets.forEach((matrix, index) =>
    errors.push(...matrixErrors(matrix, `targets[${index}]`)),
  );
  errors.push(...matrixErrors(question.initialMatrix, 'initialMatrix'));
  if (question.options.length < 4)
    errors.push('at least four answer options are required');
  const ids = new Set<string>();
  const pairs = new Set<string>();
  let correctOptions = 0;
  question.options.forEach((option) => {
    if (ids.has(option.id)) errors.push('answer option IDs must be unique');
    ids.add(option.id);
    const pair = `${matrixKey(option.first)}|${matrixKey(option.second)}`;
    if (pairs.has(pair)) errors.push('answer option pairs must be unique');
    pairs.add(pair);
    errors.push(...matrixErrors(option.first, `option ${option.id} first`));
    errors.push(...matrixErrors(option.second, `option ${option.id} second`));
    if (targetMatches(option, question.targets)) correctOptions += 1;
  });
  if (
    !question.options.some((option) => option.id === question.correctOptionId)
  )
    errors.push('correct option is missing');
  if (correctOptions !== 1)
    errors.push('exactly one answer option must match both targets');
  if (
    !question.ruleMetadata ||
    !Array.isArray(question.ruleMetadata.transformations)
  ) {
    errors.push('missing transformation metadata');
  } else {
    const replayed = replaySequence(
      question.initialMatrix,
      question.ruleMetadata.transformations,
      question.sequence.length + 1,
    );
    if (
      question.sequence.some(
        (matrix, index) => matrixKey(matrix) !== matrixKey(replayed[index]),
      )
    )
      errors.push('observed sequence does not replay from rule metadata');
    if (
      matrixKey(question.targets[0]) !==
        matrixKey(replayed[question.sequence.length]) ||
      matrixKey(question.targets[1]) !==
        matrixKey(replayed[question.sequence.length + 1])
    )
      errors.push('targets do not replay from rule metadata');
  }
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}
