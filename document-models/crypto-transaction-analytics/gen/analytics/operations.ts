import { type SignalDispatch } from "document-model";
import { type CalculateAnalyticsAction } from "./actions.js";
import { type CryptoTransactionAnalyticsState } from "../types.js";

export interface CryptoTransactionAnalyticsAnalyticsOperations {
  calculateAnalyticsOperation: (
    state: CryptoTransactionAnalyticsState,
    action: CalculateAnalyticsAction,
    dispatch?: SignalDispatch,
  ) => void;
}
