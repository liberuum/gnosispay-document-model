import { type SignalDispatch } from "document-model";
import {
  type SetBaseCurrencyAction,
  type UpdateExchangeRatesAction,
  type ConvertTransactionValuesAction,
} from "./actions.js";
import { type CryptoTransactionAnalyticsState } from "../types.js";

export interface CryptoTransactionAnalyticsCurrencyManagementOperations {
  setBaseCurrencyOperation: (
    state: CryptoTransactionAnalyticsState,
    action: SetBaseCurrencyAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateExchangeRatesOperation: (
    state: CryptoTransactionAnalyticsState,
    action: UpdateExchangeRatesAction,
    dispatch?: SignalDispatch,
  ) => void;
  convertTransactionValuesOperation: (
    state: CryptoTransactionAnalyticsState,
    action: ConvertTransactionValuesAction,
    dispatch?: SignalDispatch,
  ) => void;
}
