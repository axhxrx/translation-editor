/**
 @fileoverview This are shared i18n value definitions, that can be imported by any component or app. You can import only what you need — the rest will be tree-shaken out of the build. Example:

 ```ts
 import { localizeAll } from '@i18n/core';
 import { cancel, save } from '@i18n/common';

 const myComponenti18nDefs = { cancel, save } as const;
 const i18n = localizeAll(myComponenti18nDefs);

 # HTML: <button>{{ i18n.cancel }}</button>
 */

export const any = {
  en: 'Any',
  ja: 'すべて',
} as const;

/**
 The label for "Bundles" as in, bundles added to a SIM plan.
 */
export const bundles = {
  en: 'Bundles',
  ja: 'バンドル',
} as const;

/**
 * NOTE: A more specific action title is better, e.g. "Don't delete"
 */
export const cancel = {
  en: 'Cancel',
  ja: 'キャンセル',
} as const;

export const close = {
  en: 'Close',
  ja: '閉じる',
} as const;

export const color = {
  en: 'Color',
  ja: '色',
} as const;

/**
 * The name of this property cannot just be "delete" because that is a reserved word in JavaScript.
 */
export const deleteButtonTitle = {
  en: 'Delete',
  ja: '削除',
} as const;

export const disabled = {
  en: 'Disabled',
  ja: '無効',
} as const;

export const edit = {
  en: 'Edit',
  ja: '編集',
} as const;

export const enabled = {
  en: 'Enabled',
  ja: '有効',
} as const;

export const group = {
  en: 'Group',
  ja: 'グループ',
} as const;

export const imsi = {
  en: 'IMSI',
  ja: 'IMSI',
} as const;

export const label = {
  en: 'Label',
  ja: 'ラベル',
} as const;

export const name = {
  en: 'Name',
  ja: '名前',
} as const;

export const operator = {
  en: 'Operator',
  ja: 'オペレーター',
} as const;

export const operatorID = {
  en: 'Operator ID',
  ja: 'オペレーターID',
} as const;

export const originalUser = {
  en: 'Original user',
  ja: '元のユーザー',
} as const;

export const refresh = {
  en: 'Refresh',
  ja: '更新',
} as const;

export const reset = {
  en: 'Reset',
  ja: 'リセット',
} as const;

export const samUser = {
  en: 'SAM user',
  ja: 'SAM ユーザー',
} as const;

export const samUserName = {
  en: 'SAM user name',
  ja: 'SAMユーザー名',
} as const;

export const save = {
  en: 'Save',
  ja: '保存',
} as const;

export const saveItem = {
  en: 'Save {{item}}',
  ja: '{{item}}を保存',
} as const;

export const search = {
  en: 'Search',
  ja: '検索',
} as const;

export const speedClass = {
  en: 'Speed class',
  ja: '速度クラス',
} as const;

export const status = {
  en: 'Status',
  ja: 'ステータス',
} as const;

export const subscription = {
  en: 'Subscription',
  ja: 'サブスクリプション',
} as const;

export const trustPolicy = {
  en: 'Trust policy',
  ja: '信頼ポリシー',
} as const;

export const ErrorMessagesI18n = {
  blockedByClientFilter: {
    en: 'Request blocked by client. Please check the configuration of any web filters and/or ad blockers.',
    ja: 'リクエストが遮断されました。広告ブロッカーなどの WEB フィルターの設定をご確認ください。',
  },
  unknownError: {
    en: 'An unexpected error has occurred. Sorry for any inconvenience.',
    ja: 'エラーが発生しました。ご不便をおかけし申し訳ございません。',
  },
};
