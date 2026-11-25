import type {Locale} from '../config/i18n';

export const docIds = ['overview', 'quickstart', 'data', 'python-sdk', 'http-api', 'errors'] as const;
export type DocId = typeof docIds[number];
export const docGroups: {zh: string; en: string; pages: DocId[]}[] = [
  {zh: '开始使用', en: 'Getting started', pages: ['overview', 'quickstart']},
  {zh: '使用指南', en: 'Guides', pages: ['data']},
  {zh: '接口参考', en: 'Reference', pages: ['python-sdk', 'http-api']},
  {zh: '帮助', en: 'Help', pages: ['errors']},
];
export function docPath(locale: Locale, id: DocId) {
  return '/' + locale + '/docs/' + (id === 'overview' ? '' : id + '/');
}
