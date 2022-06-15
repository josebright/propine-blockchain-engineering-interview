export type GetLatestValueForTokensPayload = undefined;

export interface GetLatestValueForATokenPayload {
  token: string;
}

export interface GetValueForTokensOnADatePayload {
  date: string;   // YYYY-MM-DD
}

export interface GetValueForATokenOnADatePayload {
  date: string;   // YYYY-MM-DD
  token: string;
}

export type GetValuePayload =
  | GetLatestValueForTokensPayload
  | GetLatestValueForATokenPayload
  | GetValueForTokensOnADatePayload
  | GetValueForATokenOnADatePayload;

export type GetValue = (payload?: GetValuePayload) => Promise<any>;

export type GetLatestValueForTokens = (
  payload: GetLatestValueForTokensPayload
) => Promise<Record<string, number>>;

export type GetLatestValueForAToken = (
  payload: GetLatestValueForATokenPayload
) => Promise<number>;

export type GetValueForTokensOnADate = (
  payload: GetValueForTokensOnADatePayload
) => Promise<Record<string, number>>;

export type GetValueForATokenOnADate = (
  payload: GetValueForATokenOnADatePayload
) => Promise<number>;
