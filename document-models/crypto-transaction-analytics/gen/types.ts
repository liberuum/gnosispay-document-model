import type { PHDocument, PHBaseState } from "document-model";
import type { CryptoTransactionAnalyticsAction } from "./actions.js";
import type { CryptoTransactionAnalyticsState as CryptoTransactionAnalyticsGlobalState } from "./schema/types.js";

type CryptoTransactionAnalyticsLocalState = Record<PropertyKey, never>;
type CryptoTransactionAnalyticsPHState = PHBaseState & {
  global: CryptoTransactionAnalyticsGlobalState;
  local: CryptoTransactionAnalyticsLocalState;
};
type CryptoTransactionAnalyticsDocument =
  PHDocument<CryptoTransactionAnalyticsPHState>;

export * from "./schema/types.js";

export type {
  CryptoTransactionAnalyticsGlobalState,
  CryptoTransactionAnalyticsLocalState,
  CryptoTransactionAnalyticsPHState,
  CryptoTransactionAnalyticsAction,
  CryptoTransactionAnalyticsDocument,
};
