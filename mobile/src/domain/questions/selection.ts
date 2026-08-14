import type { Difficulty, TaskType } from './types';

export interface QuestionSelectionCriteria {
  taskType: TaskType;
  difficulty?: Difficulty;
  count: number;
}

export interface QuestionSelector<T> {
  select(criteria: QuestionSelectionCriteria): T[];
}
