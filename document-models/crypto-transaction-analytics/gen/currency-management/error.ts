export type ErrorCode = "TransactionNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class TransactionNotFoundError extends Error implements ReducerError {
  errorCode = "TransactionNotFoundError" as ErrorCode;
  constructor(message = "TransactionNotFoundError") {
    super(message);
  }
}

export const errors = {
  ConvertTransactionValues: {
    TransactionNotFoundError,
  },
};
