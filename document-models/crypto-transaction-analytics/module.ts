import type { DocumentModelModule } from "document-model";
import { createState } from "document-model";
import { defaultBaseState } from "document-model/core";
import type { CryptoTransactionAnalyticsPHState } from "ba-workshop/document-models/crypto-transaction-analytics";
import {
  actions,
  documentModel,
  reducer,
  utils,
} from "ba-workshop/document-models/crypto-transaction-analytics";

/** Document model module for the Todo List document type */
export const CryptoTransactionAnalytics: DocumentModelModule<CryptoTransactionAnalyticsPHState> =
  {
    reducer,
    actions,
    utils,
    documentModel: createState(defaultBaseState(), documentModel),
  };
