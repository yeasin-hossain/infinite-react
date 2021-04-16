export type TableEnhancedData<T> = {
  data: T | null;
  groupData?: T[];
  value?: any;
  isGroupRow?: boolean;
  groupNesting?: number;
  groupKeys?: any[];
  groupCount?: number;
};
