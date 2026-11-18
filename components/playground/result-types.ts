import type {KumoRequestError, KumoResult} from '../../lib/kumo-api';
import type {ClassificationEvaluation} from '../../lib/evaluation';

export type RunSource = {kind: 'builtin'; exampleId: string} | {kind: 'upload'};

export type PlaygroundRunState =
  | {status: 'idle'}
  | {status: 'running'}
  | {status: 'error'; code: KumoRequestError; message: string}
  | {status: 'success'; result: KumoResult; source: RunSource; evaluation: ClassificationEvaluation | null};
