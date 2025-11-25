export type ErrorCode = "InvalidCsvFormatError" | "TransactionNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidCsvFormatError extends Error implements ReducerError {
  errorCode = "InvalidCsvFormatError" as ErrorCode;
  constructor(message = "InvalidCsvFormatError") {
    super(message);
  }
}

export class TransactionNotFoundError extends Error implements ReducerError {
  errorCode = "TransactionNotFoundError" as ErrorCode;
  constructor(message = "TransactionNotFoundError") {
    super(message);
  }
}

export const errors = {
  ImportCsvTransactions: {
    InvalidCsvFormatError,
  },
  UpdateTransaction: {
    TransactionNotFoundError,
  },
  DeleteTransaction: {
    TransactionNotFoundError,
  },
};
