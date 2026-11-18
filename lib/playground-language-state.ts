import type {ParsedCsv} from './csv';
import type {PlaygroundRunState} from '../components/playground/result-types';

export const playgroundLanguageEvent = 'thinkcat:playground-language';
export type PlaygroundLanguageState = {
  source: {csv: ParsedCsv | null; labelIndex: number; exampleId: string | null};
  runState: PlaygroundRunState;
};

// One short-lived, in-memory handoff only. Never persist uploaded data in storage.
let handoff: {destination: string; expires: number; state: PlaygroundLanguageState} | null = null;
export function savePlaygroundLanguageState(destination: string, state: PlaygroundLanguageState) {
  handoff = {destination, expires: Date.now() + 30_000, state};
}
export function readPlaygroundLanguageState(destination: string): PlaygroundLanguageState | null {
  if (!handoff || handoff.expires < Date.now()) { handoff = null; return null; }
  return handoff.destination === destination ? handoff.state : null;
}
export function clearPlaygroundLanguageState(destination: string) {
  if (handoff?.destination === destination) handoff = null;
}
