import type {KumoRequestError, KumoResult} from '../../lib/kumo-api';

export type PlaygroundRunState =
  | {status: 'idle'}
  | {status: 'running'}
  | {status: 'error'; code: KumoRequestError; message: string}
  | {status: 'success'; result: KumoResult};
