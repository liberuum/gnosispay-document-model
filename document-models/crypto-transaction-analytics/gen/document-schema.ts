import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { cryptoTransactionAnalyticsDocumentType } from "./document-type.js";
import { CryptoTransactionAnalyticsStateSchema } from "./schema/zod.js";
import type {
  CryptoTransactionAnalyticsDocument,
  CryptoTransactionAnalyticsPHState,
} from "./types.js";

/** Schema for validating the header object of a CryptoTransactionAnalytics document */
export const CryptoTransactionAnalyticsDocumentHeaderSchema =
  BaseDocumentHeaderSchema.extend({
    documentType: z.literal(cryptoTransactionAnalyticsDocumentType),
  });

/** Schema for validating the state object of a CryptoTransactionAnalytics document */
export const CryptoTransactionAnalyticsPHStateSchema =
  BaseDocumentStateSchema.extend({
    global: CryptoTransactionAnalyticsStateSchema(),
  });

export const CryptoTransactionAnalyticsDocumentSchema = z.object({
  header: CryptoTransactionAnalyticsDocumentHeaderSchema,
  state: CryptoTransactionAnalyticsPHStateSchema,
  initialState: CryptoTransactionAnalyticsPHStateSchema,
});

/** Simple helper function to check if a state object is a CryptoTransactionAnalytics document state object */
export function isCryptoTransactionAnalyticsState(
  state: unknown,
): state is CryptoTransactionAnalyticsPHState {
  return CryptoTransactionAnalyticsPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a CryptoTransactionAnalytics document state object */
export function assertIsCryptoTransactionAnalyticsState(
  state: unknown,
): asserts state is CryptoTransactionAnalyticsPHState {
  CryptoTransactionAnalyticsPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a CryptoTransactionAnalytics document */
export function isCryptoTransactionAnalyticsDocument(
  document: unknown,
): document is CryptoTransactionAnalyticsDocument {
  return CryptoTransactionAnalyticsDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a CryptoTransactionAnalytics document */
export function assertIsCryptoTransactionAnalyticsDocument(
  document: unknown,
): asserts document is CryptoTransactionAnalyticsDocument {
  CryptoTransactionAnalyticsDocumentSchema.parse(document);
}
