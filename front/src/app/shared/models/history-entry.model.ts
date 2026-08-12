import { ConversionType } from '../../converter/models/converter.models';

export const STORAGE_KEYS = {
  history: 'mc-history',
  pendingRestore: 'mc-pending-restore',
  darkMode: 'mc-dark-mode',
} as const;

export interface HistoryEntry {
  id: string;
  type: ConversionType;
  label: string;
  inputSnippet: string;
  input: string;
  timestamp: number;
}
