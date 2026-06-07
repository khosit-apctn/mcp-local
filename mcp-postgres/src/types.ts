export type AllowedOperator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'LIKE'
  | 'ILIKE'
  | 'IN'
  | 'IS'
  | 'IS NOT';

export interface Filter {
  column: string;
  operator: AllowedOperator;
  value: any;
}
