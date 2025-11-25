interface SortableHeaderProps {
  label: string;
  onClick: () => void;
  isActive: boolean;
  direction: SortDirection;
}

function SortableHeader({
  label,
  onClick,
  isActive,
  direction,
}: SortableHeaderProps) {
  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="text-gray-400">
          {isActive ? (direction === "asc" ? "▲" : "▼") : "▽"}
        </span>
      </div>
    </th>
  );
}
import { useMemo, useState } from "react";
import { EditCryptoTransactionAnalyticsName } from "./components/EditName.js";
import { CsvUploader } from "./components/CsvUploader.js";
import type { ParsedTransaction } from "./components/CsvUploader.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { useSelectedCryptoTransactionAnalyticsDocument } from "ba-workshop/document-models/crypto-transaction-analytics";

const TRACKED_ADDRESS =
  import.meta.env.VITE_TRACKED_ETH_ADDRESS?.toLowerCase() ||
  "0x0000000000000000000000000000000000000000";
const EXCLUDED_CONTRACT =
  import.meta.env.VITE_EXCLUDED_CONTRACT_ADDRESS?.toLowerCase() ||
  "0x0000000000000000000000000000000000000000";

interface DocumentTransaction {
  id: string;
  txHash: string;
  timestamp: string;
  contractAddress?: string | null;
  fromAddress?: string | null;
  toAddress?: string | null;
  valueIn?: { amount?: number | null; token?: string | null } | null;
  valueOut?: { amount?: number | null; token?: string | null } | null;
  txnFee: { amount: number; token: string };
  status: string;
}

/** Implement your editor behavior here */
export default function Editor() {
  return (
    <ErrorBoundary>
      <EditorContent />
    </ErrorBoundary>
  );
}

type SortDirection = "asc" | "desc";
type SortField = "timestamp" | "amount" | "token";

function EditorContent() {
  const [document] = useSelectedCryptoTransactionAnalyticsDocument();
  const [uploadSuccess, setUploadSuccess] = useState<{
    transactionCount: number;
    documentId: string;
    transactions: ParsedTransaction[];
  } | null>(null);
  const [previewTransactions, setPreviewTransactions] = useState<
    ParsedTransaction[] | null
  >(null);
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  console.log("EditorContent render - document:", document);
  console.log("Document exists:", !!document);
  console.log("Upload success state:", uploadSuccess);

  if (document) {
    console.log("Document ID:", document.header?.id);
    console.log("Document state:", document.state);
    console.log("Transactions:", document.state?.global?.transactions);
  }

  const previewRows = useMemo(
    () => filterPreviewTransactions(previewTransactions ?? []),
    [previewTransactions],
  );
  const documentRows = useMemo(
    () =>
      filterDocumentTransactions(
        ((document?.state?.global?.transactions ??
          []) as DocumentTransaction[]) || [],
      ),
    [document?.state?.global?.transactions],
  );

  const trackedAddress =
    useMemo(
      () => deriveTrackedAddress(previewRows, documentRows),
      [previewRows, documentRows],
    ) || TRACKED_ADDRESS;

  const isPreview = previewRows.length > 0;

  const tokenAnalytics = useMemo(() => {
    if (!uploadSuccess) {
      return [];
    }
    return isPreview
      ? buildPreviewAnalytics(previewRows, trackedAddress)
      : buildDocumentAnalytics(documentRows, trackedAddress);
  }, [uploadSuccess, isPreview, previewRows, documentRows, trackedAddress]);

  const trackedTokenSummary = useMemo(
    () =>
      uploadSuccess && tokenAnalytics.length > 0
        ? selectTrackedTokenSummary(tokenAnalytics)
        : null,
    [uploadSuccess, tokenAnalytics],
  );

  const balanceTimeline = useMemo(() => {
    if (!uploadSuccess || !trackedTokenSummary) {
      return [];
    }
    return isPreview
      ? buildPreviewBalanceTimeline(
          previewRows,
          trackedAddress,
          trackedTokenSummary,
        )
      : buildDocumentBalanceTimeline(
          documentRows,
          trackedAddress,
          trackedTokenSummary,
        );
  }, [
    uploadSuccess,
    trackedTokenSummary,
    isPreview,
    previewRows,
    documentRows,
    trackedAddress,
  ]);

  const monthlyAnalytics = useMemo(() => {
    if (!uploadSuccess || !trackedTokenSummary) {
      return [];
    }
    const rows = isPreview ? previewRows : documentRows;
    return calculateMonthlyAnalytics(
      rows,
      isPreview,
      trackedAddress,
      trackedTokenSummary.key,
    );
  }, [
    uploadSuccess,
    trackedTokenSummary,
    isPreview,
    previewRows,
    documentRows,
    trackedAddress,
  ]);

  const sortedTransactions = useMemo(() => {
    if (!uploadSuccess) {
      return [];
    }
    const rows = isPreview ? previewRows : documentRows;
    return sortTransactions(
      rows,
      sortField,
      sortDirection,
      isPreview,
      trackedAddress,
    );
  }, [
    uploadSuccess,
    isPreview,
    previewRows,
    documentRows,
    sortField,
    sortDirection,
    trackedAddress,
  ]);

  function handleSort(field: SortField) {
    setSortDirection((prev) =>
      sortField === field ? (prev === "asc" ? "desc" : "asc") : "desc",
    );
    setSortField(field);
  }

  // If we have upload success state, show success page regardless of document state
  if (uploadSuccess) {
    const displayRows = isPreview ? previewRows : documentRows;
    const totalTransactions = displayRows.length;
    return (
      <div className="py-4 px-8 max-w-7xl mx-auto">
        <div className="text-center mt-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            CSV Upload Successful!
          </h2>

          {/* Transaction Count */}
          <div className="max-w-3xl mx-auto grid gap-4 sm:grid-cols-2 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-lg text-green-800 font-medium">
                {uploadSuccess.transactionCount} transactions detected
              </p>
              <p className="text-sm text-green-600 mt-2">
                Data has been processed and stored in the document
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <p className="text-sm font-medium text-blue-800">
                Tracked EVM Address
              </p>
              <p className="mt-2 font-mono text-base text-blue-900 break-all">
                {trackedAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Token Analytics */}
        {tokenAnalytics.length > 0 && (
          <div className="mt-8 bg-white shadow rounded-lg border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Token Analytics
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Grouped by contract address, showing ticker/label totals
              </p>
            </div>
            <dl className="grid gap-4 px-6 py-4 sm:grid-cols-2 lg:grid-cols-3">
              {tokenAnalytics.map((token) => (
                <div
                  key={token.key}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                >
                  <dt className="text-sm font-medium text-gray-600">
                    {token.label}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {token.total.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 4,
                    })}
                  </dd>
                  <p className="text-xs text-gray-400 mt-1 break-words">
                    {token.key}
                  </p>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Balance Timeline */}
        {balanceTimeline &&
          balanceTimeline.length > 0 &&
          trackedTokenSummary && (
            <div className="mt-8 bg-white shadow rounded-lg border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Balance Over Time ({trackedTokenSummary.label})
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Tracking wallet {shortenAddress(trackedAddress)}
                </p>
              </div>
              <div className="px-6 py-6">
                <BalanceTimeline
                  points={balanceTimeline}
                  trackedAddress={trackedAddress}
                  tokenLabel={trackedTokenSummary.label}
                  endingBalanceOverride={trackedTokenSummary.total}
                />
              </div>

              {/* Monthly Income/Expense Overview */}
              {monthlyAnalytics.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-gray-900">
                      Previous 6 Months Overview ({trackedTokenSummary.label})
                    </h4>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                        <span>Income</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
                        <span>Expense</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-gray-600 rounded-sm"></div>
                        <span>Net</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-4 text-sm">
                    {monthlyAnalytics.map((month) => (
                      <div key={month.month} className="text-center">
                        <div className="font-medium text-gray-700 mb-2 text-xs">
                          {month.month}
                        </div>
                        <div className="space-y-1">
                          <div className="text-green-600 text-xs">
                            +
                            {month.income.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 1,
                            })}
                          </div>
                          <div className="text-red-600 text-xs">
                            -
                            {month.expense.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 1,
                            })}
                          </div>
                          <div
                            className={`font-medium text-xs ${
                              month.net >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {month.net >= 0 ? "+" : ""}
                            {month.net.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 1,
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Transaction List */}
        {totalTransactions > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Imported Transactions ({totalTransactions}
              {isPreview ? " preview" : ""})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Hash
                    </th>
                    <SortableHeader
                      label="Date/Time"
                      onClick={() => handleSort("timestamp")}
                      isActive={sortField === "timestamp"}
                      direction={sortDirection}
                    />
                    <SortableHeader
                      label="Amount"
                      onClick={() => handleSort("amount")}
                      isActive={sortField === "amount"}
                      direction={sortDirection}
                    />
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedTransactions.slice(0, 100).map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      txHash={tx.txHash}
                      timestamp={tx.timestamp}
                      rawTimestamp={tx.rawTimestamp}
                      amountDisplay={tx.amountDisplay}
                      token={tx.token}
                      feeDisplay={tx.feeDisplay}
                      status={tx.status}
                    />
                  ))}
                </tbody>
              </table>
              {totalTransactions > 100 && (
                <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500 text-center">
                  Showing first 100 transactions of {totalTransactions} total
                </div>
              )}
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-8 max-w-md mx-auto">
          <details className="text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
              Debug Information
            </summary>
            <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded border">
              <p>Document ID: {uploadSuccess.documentId}</p>
              <p>Transactions Imported: {uploadSuccess.transactionCount}</p>
              <p>
                Current Document State:{" "}
                {document ? "Available" : "Disconnected"}
              </p>
              <p>
                Hook Status:{" "}
                {document === null
                  ? "null"
                  : document === undefined
                    ? "undefined"
                    : "connected"}
              </p>
              {document && (
                <p>
                  Actual Transactions in State:{" "}
                  {document.state.global.transactions?.length || 0}
                </p>
              )}
              {previewTransactions && (
                <p>Preview Transactions Loaded: {previewTransactions.length}</p>
              )}
            </div>
          </details>
        </div>
      </div>
    );
  }

  if (!document) {
    console.log("Document is null/undefined, showing loading...");
    return (
      <div className="py-4 px-8 max-w-7xl mx-auto">
        <div className="text-center text-gray-500 mt-8">
          <p>Loading document...</p>
          <div className="mt-4 text-xs text-gray-400">
            Document state:{" "}
            {document === null
              ? "null"
              : document === undefined
                ? "undefined"
                : "other"}
          </div>
        </div>
      </div>
    );
  }

  // Show upload interface if no transactions yet
  return (
    <div className="py-4 px-8 max-w-7xl mx-auto">
      <EditCryptoTransactionAnalyticsName />

      <div className="mt-8">
        {/* CSV Upload Section */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Import Transactions
          </h3>
          <CsvUploader
            onUploadSuccess={(data) => {
              setUploadSuccess(data);
              setPreviewTransactions(data.transactions);
            }}
          />
        </section>
      </div>
    </div>
  );
}

interface TransactionRowProps {
  txHash: string;
  timestamp: string | null;
  rawTimestamp: string;
  amountDisplay: string;
  token: string;
  feeDisplay: string;
  status: string;
}

function TransactionRow({
  txHash,
  timestamp,
  rawTimestamp,
  amountDisplay,
  token,
  feeDisplay,
  status,
}: TransactionRowProps) {
  const shortHash =
    txHash && txHash.length > 18
      ? `${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}`
      : txHash || "N/A";

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{shortHash}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {timestamp
            ? new Date(timestamp).toLocaleDateString()
            : rawTimestamp || "—"}
        </div>
        <div className="text-xs text-gray-500">
          {timestamp ? new Date(timestamp).toLocaleTimeString() : ""}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div
          className={`text-sm font-medium ${
            amountDisplay.startsWith("-")
              ? "text-red-600"
              : amountDisplay === "0"
                ? "text-gray-900"
                : "text-green-600"
          }`}
        >
          {amountDisplay}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {token || "Unknown"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{feeDisplay}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === "SUCCESS"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </span>
      </td>
    </tr>
  );
}

interface TokenAnalyticsSummary {
  key: string;
  label: string;
  total: number;
}

interface BalancePoint {
  timestamp: number;
  balance: number;
}

interface NormalizedTransactionRow {
  id: string;
  txHash: string;
  timestamp: string | null;
  rawTimestamp: string;
  amountNumeric: number;
  amountDisplay: string;
  token: string;
  feeDisplay: string;
  status: string;
}

function filterPreviewTransactions(
  rows: ParsedTransaction[],
): ParsedTransaction[] {
  return rows.filter(
    (tx) =>
      !tx.contractAddress ||
      tx.contractAddress.toLowerCase() !== EXCLUDED_CONTRACT,
  );
}

function filterDocumentTransactions(
  rows: DocumentTransaction[],
): DocumentTransaction[] {
  return rows.filter(
    (tx) =>
      !tx.contractAddress ||
      tx.contractAddress.toLowerCase() !== EXCLUDED_CONTRACT,
  );
}

function deriveTrackedAddress(
  previewRows: ParsedTransaction[],
  documentRows: DocumentTransaction[],
): string | null {
  const counts = new Map<string, { count: number; original: string }>();

  const consider = (address?: string | null) => {
    if (!address) return;
    const normalized = address.toLowerCase();
    const existing = counts.get(normalized) || { count: 0, original: address };
    existing.count += 1;
    counts.set(normalized, existing);
  };

  previewRows.forEach((tx) => {
    consider(tx.fromAddress);
    consider(tx.toAddress);
  });

  if (counts.size === 0) {
    documentRows.forEach((tx) => {
      consider(tx.fromAddress);
      consider(tx.toAddress);
    });
  }

  if (counts.size === 0) {
    return null;
  }

  let topAddress: string | null = null;
  let topCount = -1;
  counts.forEach((value, key) => {
    if (value.count > topCount) {
      topCount = value.count;
      topAddress = value.original.startsWith("0x") ? value.original : key;
    }
  });

  return topAddress;
}

function buildPreviewAnalytics(
  rows: ParsedTransaction[],
  trackedAddress: string | null,
): TokenAnalyticsSummary[] {
  const map = new Map<string, TokenAnalyticsSummary>();

  rows.forEach((tx) => {
    const delta = getPreviewSignedAmount(tx, trackedAddress);
    if (delta === 0) return;
    const contractKey = tx.contractAddress || tx.token || "UNKNOWN";
    const existing = map.get(contractKey) || {
      key: contractKey,
      label: tx.token || "Unknown",
      total: 0,
    };
    existing.total += delta;
    existing.label = tx.token || existing.label;
    map.set(contractKey, existing);
  });

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

function buildDocumentAnalytics(
  rows: DocumentTransaction[],
  trackedAddress: string | null,
): TokenAnalyticsSummary[] {
  const map = new Map<string, TokenAnalyticsSummary>();

  rows.forEach((tx) => {
    const delta = getDocumentSignedAmount(tx, trackedAddress);
    if (!delta) return;
    const contract = tx?.contractAddress || tx?.valueOut?.token || "UNKNOWN";
    const label =
      tx?.valueOut?.token || tx?.valueIn?.token || contract || "Unknown";

    const existing = map.get(contract) || {
      key: contract,
      label,
      total: 0,
    };
    existing.total += delta;
    existing.label = label;
    map.set(contract, existing);
  });

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

function selectTrackedTokenSummary(
  summaries: TokenAnalyticsSummary[],
): TokenAnalyticsSummary | null {
  if (!summaries.length) return null;
  const gbpSummary =
    summaries.find((summary) => summary.label?.toLowerCase().includes("gbp")) ||
    summaries.find((summary) => summary.label?.toUpperCase() === "GBPE");
  return gbpSummary || summaries[0];
}

function buildPreviewBalanceTimeline(
  rows: ParsedTransaction[],
  trackedAddress: string | null,
  tokenSummary: TokenAnalyticsSummary,
): BalancePoint[] {
  if (!tokenSummary) return [];
  const sorted = [...rows].sort(
    (a, b) =>
      (a.timestamp ? Date.parse(a.timestamp) : 0) -
      (b.timestamp ? Date.parse(b.timestamp) : 0),
  );

  const points: BalancePoint[] = [];
  let balance = 0;
  let referenceTime = sorted[0]
    ? Date.parse(sorted[0].timestamp || "") || Date.now()
    : Date.now();

  if (sorted.length) {
    points.push({ timestamp: referenceTime - 1, balance: 0 });
  }

  sorted.forEach((tx, index) => {
    if (getPreviewTokenKey(tx) !== tokenSummary.key) {
      return;
    }
    const delta = computePreviewDelta(tx, trackedAddress);
    if (delta === 0) return;
    const timestamp =
      (tx.timestamp ? Date.parse(tx.timestamp) : referenceTime + index + 1) ||
      referenceTime + index + 1;
    balance += delta;
    points.push({ timestamp, balance });
    referenceTime = timestamp;
  });

  return points;
}

function buildDocumentBalanceTimeline(
  rows: DocumentTransaction[],
  trackedAddress: string | null,
  tokenSummary: TokenAnalyticsSummary,
): BalancePoint[] {
  if (!tokenSummary) return [];
  const sorted = [...rows].sort(
    (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
  );

  const points: BalancePoint[] = [];
  let balance = 0;

  if (sorted.length) {
    const firstTimestamp = Date.parse(sorted[0].timestamp);
    points.push({ timestamp: firstTimestamp - 1, balance: 0 });
  }

  sorted.forEach((tx) => {
    if (getDocumentTokenKey(tx) !== tokenSummary.key) {
      return;
    }
    const delta = computeDocumentDelta(tx, trackedAddress);
    if (delta === 0) return;
    const timestamp = Date.parse(tx.timestamp);
    balance += delta;
    points.push({ timestamp, balance });
  });

  return points;
}

function computePreviewDelta(
  tx: ParsedTransaction,
  trackedAddress: string | null,
): number {
  return getPreviewSignedAmount(tx, trackedAddress);
}

function computeDocumentDelta(
  tx: DocumentTransaction,
  trackedAddress: string | null,
): number {
  return getDocumentSignedAmount(tx, trackedAddress);
}

function getPreviewSignedAmount(
  tx: ParsedTransaction,
  trackedAddress: string | null,
): number {
  const normalized = trackedAddress?.toLowerCase();
  if (!normalized) return 0;
  const fromMatches = tx.fromAddress?.toLowerCase() === normalized;
  const toMatches = tx.toAddress?.toLowerCase() === normalized;
  const outgoingAmount = tx.amountOut ?? tx.amountIn ?? 0;
  const incomingAmount = tx.amountIn ?? tx.amountOut ?? 0;
  if (fromMatches && !toMatches) {
    return -(outgoingAmount || 0);
  }
  if (toMatches && !fromMatches) {
    return incomingAmount || 0;
  }
  return 0;
}

function getDocumentSignedAmount(
  tx: DocumentTransaction,
  trackedAddress: string | null,
): number {
  const normalized = trackedAddress?.toLowerCase();
  if (!normalized) return 0;
  const fromMatches = tx.fromAddress?.toLowerCase() === normalized;
  const toMatches = tx.toAddress?.toLowerCase() === normalized;
  const outgoingAmount = tx.valueOut?.amount ?? tx.valueIn?.amount ?? 0;
  const incomingAmount = tx.valueIn?.amount ?? tx.valueOut?.amount ?? 0;
  if (fromMatches && !toMatches) {
    return -(outgoingAmount || 0);
  }
  if (toMatches && !fromMatches) {
    return incomingAmount || 0;
  }
  return 0;
}

function getPreviewTokenKey(tx: ParsedTransaction) {
  return tx.contractAddress || tx.token || "UNKNOWN";
}

function getDocumentTokenKey(tx: DocumentTransaction) {
  return (
    tx.contractAddress || tx.valueOut?.token || tx.valueIn?.token || "UNKNOWN"
  );
}

function sortTransactions(
  rows: ParsedTransaction[] | DocumentTransaction[],
  field: SortField,
  direction: SortDirection,
  isPreview: boolean,
  trackedAddress: string | null,
): NormalizedTransactionRow[] {
  const normalized = rows.map((tx, index) =>
    isPreview
      ? normalizePreviewTransaction(
          tx as ParsedTransaction,
          index,
          trackedAddress,
        )
      : normalizeDocumentTransaction(tx as DocumentTransaction, trackedAddress),
  );

  const multiplier = direction === "asc" ? 1 : -1;

  normalized.sort((a, b) => {
    if (field === "amount") {
      return (a.amountNumeric - b.amountNumeric) * multiplier;
    }
    if (field === "timestamp") {
      const timeA = a.timestamp ? Date.parse(a.timestamp) : 0;
      const timeB = b.timestamp ? Date.parse(b.timestamp) : 0;
      return (timeA - timeB) * multiplier;
    }
    if (field === "token") {
      return a.token.localeCompare(b.token) * multiplier;
    }
    return 0;
  });

  return normalized;
}

function normalizePreviewTransaction(
  tx: ParsedTransaction,
  index: number,
  trackedAddress: string | null,
): NormalizedTransactionRow {
  const signedAmount = getPreviewSignedAmount(tx, trackedAddress);
  const amountDisplay =
    signedAmount !== 0
      ? signedAmount.toFixed(4)
      : tx.amountOut !== null
        ? tx.amountOut.toFixed(4)
        : tx.rawAmountOut || "0";

  return {
    id: `${tx.transactionHash}-${index}`,
    txHash: tx.transactionHash,
    timestamp: tx.timestamp,
    rawTimestamp: tx.rawTimestamp,
    amountNumeric: signedAmount || 0,
    amountDisplay,
    token: tx.token || "Unknown",
    feeDisplay:
      tx.feeAmount !== null
        ? `${tx.feeAmount.toFixed(6)} ${tx.feeToken}`.trim()
        : tx.rawFee || "N/A",
    status: tx.status || "UNKNOWN",
  };
}

function normalizeDocumentTransaction(
  tx: DocumentTransaction,
  trackedAddress: string | null,
): NormalizedTransactionRow {
  const signedAmount = getDocumentSignedAmount(tx, trackedAddress);
  const amountOut = tx.valueOut?.amount ?? tx.valueIn?.amount ?? 0;

  return {
    id: tx.id,
    txHash: tx.txHash,
    timestamp: tx.timestamp,
    rawTimestamp: "",
    amountNumeric: signedAmount || amountOut || 0,
    amountDisplay:
      signedAmount !== 0
        ? signedAmount.toFixed(4)
        : amountOut
          ? amountOut.toFixed(4)
          : "0",
    token:
      tx.valueOut?.token ||
      tx.valueIn?.token ||
      tx.contractAddress ||
      "Unknown",
    feeDisplay: `${tx.txnFee.amount.toFixed(4)} ${tx.txnFee.token}`,
    status: tx.status,
  };
}

function BalanceTimeline({
  points,
  trackedAddress,
  tokenLabel,
  endingBalanceOverride,
}: {
  points: BalancePoint[];
  trackedAddress: string | null;
  tokenLabel: string;
  endingBalanceOverride?: number;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<BalancePoint | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  if (!points.length) {
    return (
      <div className="text-sm text-gray-500">
        No qualifying transactions to plot yet.
      </div>
    );
  }

  const width = 800;
  const height = 280;
  const padding = 32;
  const axisPadding = 16;
  const minBalance = Math.min(0, ...points.map((p) => p.balance));
  const maxBalance = Math.max(0, ...points.map((p) => p.balance));
  const balanceRange = maxBalance - minBalance || 1;
  const uniquePoints = points.length > 1 ? points : [...points, points[0]];
  const firstTimestamp = uniquePoints[0].timestamp;
  const lastTimestamp = uniquePoints[uniquePoints.length - 1].timestamp;
  const timeRange = lastTimestamp - firstTimestamp || 1;

  const handleMouseMove = (event: React.MouseEvent<SVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = event.clientX - rect.left;

    // Convert SVG coordinates to graph coordinates
    const graphX =
      ((svgX - padding) / (width - padding * 2)) * timeRange + firstTimestamp;

    // Find the closest point
    let closestPoint = uniquePoints[0];
    let minDistance = Math.abs(closestPoint.timestamp - graphX);

    for (const point of uniquePoints) {
      const distance = Math.abs(point.timestamp - graphX);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    }

    setHoveredPoint(closestPoint);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setMousePosition(null);
  };

  const yTicks = 4;
  const yValues = Array.from({ length: yTicks + 1 }, (_, index) => {
    const ratio = index / yTicks;
    return maxBalance - ratio * balanceRange;
  });

  const xTicks = 4;
  const xValues = Array.from({ length: xTicks + 1 }, (_, index) => {
    const timestamp =
      firstTimestamp + (index / xTicks) * (lastTimestamp - firstTimestamp);
    return timestamp;
  });

  const pathData = uniquePoints
    .map((point, index) => {
      const x =
        padding +
        ((point.timestamp - firstTimestamp) / timeRange) *
          (width - padding * 2);
      const y =
        height -
        padding -
        axisPadding -
        ((point.balance - minBalance) / balanceRange) *
          (height - padding * 2 - axisPadding);
      const command = index === 0 ? "M" : "L";
      return `${command}${x} ${y}`;
    })
    .join(" ");

  const resultingBalance = uniquePoints[uniquePoints.length - 1].balance;
  const endingBalance =
    endingBalanceOverride !== undefined
      ? endingBalanceOverride
      : resultingBalance;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-4">
        <div>
          <p className="text-xs uppercase text-gray-500 tracking-wide">
            Ending Balance ({tokenLabel})
          </p>
          <p className="text-3xl font-semibold text-gray-900">
            {endingBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })}
          </p>
          {trackedAddress && (
            <p className="text-xs text-gray-500 font-mono mt-1 break-all">
              {trackedAddress}
            </p>
          )}
        </div>
      </div>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: "crosshair" }}
      >
        <defs>
          <linearGradient
            id="balance-gradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yValues.map((value, index) => {
          const y =
            height -
            padding -
            axisPadding -
            ((value - minBalance) / balanceRange) *
              (height - padding * 2 - axisPadding);
          return (
            <g key={`y-tick-${index}`}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={0.75}
                strokeDasharray="4 4"
              />
              <text
                x={padding - 8}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-400"
              >
                {value.toFixed(2)}
              </text>
            </g>
          );
        })}

        {xValues.map((timestamp, index) => {
          const x =
            padding +
            ((timestamp - firstTimestamp) / timeRange) * (width - padding * 2);
          return (
            <g key={`x-tick-${index}`}>
              <line
                x1={x}
                y1={height - padding - axisPadding}
                x2={x}
                y2={height - padding - axisPadding + 6}
                stroke="#9ca3af"
                strokeWidth={1}
              />
              <text
                x={x}
                y={height - padding + 12}
                textAnchor="middle"
                className="text-xs fill-gray-400"
              >
                {new Date(timestamp).toLocaleDateString()}
              </text>
            </g>
          );
        })}

        <path
          d={`${pathData} L ${width - padding} ${
            height - padding - axisPadding
          } L ${padding} ${height - padding - axisPadding} Z`}
          fill="url(#balance-gradient)"
          opacity={0.3}
        />
        <path
          d={pathData}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <line
          x1={padding}
          y1={height - padding - axisPadding}
          x2={width - padding}
          y2={height - padding - axisPadding}
          stroke="#374151"
          strokeWidth="1.5"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding - axisPadding}
          stroke="#374151"
          strokeWidth="1.5"
        />

        <text
          x={width / 2}
          y={height - 4}
          textAnchor="middle"
          className="text-xs fill-gray-500"
        >
          Time
        </text>
        <text
          x={12}
          y={height / 2}
          transform={`rotate(-90 12 ${height / 2})`}
          textAnchor="middle"
          className="text-xs fill-gray-500"
        >
          Balance ({tokenLabel})
        </text>

        {/* Hover point */}
        {hoveredPoint &&
          (() => {
            const x =
              padding +
              ((hoveredPoint.timestamp - firstTimestamp) / timeRange) *
                (width - padding * 2);
            const y =
              height -
              padding -
              axisPadding -
              ((hoveredPoint.balance - minBalance) / balanceRange) *
                (height - padding * 2 - axisPadding);

            return (
              <g>
                {/* Vertical line */}
                <line
                  x1={x}
                  y1={height - padding - axisPadding}
                  x2={x}
                  y2={padding}
                  stroke="#6366f1"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />
                {/* Point */}
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#6366f1"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            );
          })()}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && mousePosition && (
        <div
          style={{
            position: "fixed",
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            zIndex: 1000,
            pointerEvents: "none",
          }}
          className="bg-gray-800 text-white p-2 rounded shadow-lg text-xs"
        >
          <div className="font-medium">
            {new Date(hoveredPoint.timestamp).toLocaleDateString()}{" "}
            {new Date(hoveredPoint.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div>
            Balance:{" "}
            {hoveredPoint.balance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })}{" "}
            {tokenLabel}
          </div>
        </div>
      )}
    </div>
  );
}

function shortenAddress(address: string | null) {
  if (!address) return "Unknown";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

interface MonthlyAnalytics {
  month: string;
  income: number;
  expense: number;
  net: number;
}

function calculateMonthlyAnalytics(
  rows: ParsedTransaction[] | DocumentTransaction[],
  isPreview: boolean,
  trackedAddress: string | null,
  tokenKey: string,
): MonthlyAnalytics[] {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const monthlyData = new Map<string, { income: number; expense: number }>();

  // Initialize past 6 months
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyData.set(monthKey, { income: 0, expense: 0 });
  }

  rows.forEach((tx) => {
    let timestamp: Date;
    let tokenMatch = false;
    let signedAmount = 0;

    if (isPreview) {
      const previewTx = tx as ParsedTransaction;
      if (!previewTx.timestamp) return;
      timestamp = new Date(previewTx.timestamp);
      tokenMatch = getPreviewTokenKey(previewTx) === tokenKey;
      signedAmount = getPreviewSignedAmount(previewTx, trackedAddress);
    } else {
      const docTx = tx as DocumentTransaction;
      timestamp = new Date(docTx.timestamp);
      tokenMatch = getDocumentTokenKey(docTx) === tokenKey;
      signedAmount = getDocumentSignedAmount(docTx, trackedAddress);
    }

    if (!tokenMatch || timestamp < sixMonthsAgo) return;

    const monthKey = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, "0")}`;
    const monthData = monthlyData.get(monthKey);

    if (monthData) {
      if (signedAmount > 0) {
        monthData.income += signedAmount;
      } else if (signedAmount < 0) {
        monthData.expense += Math.abs(signedAmount);
      }
    }
  });

  return Array.from(monthlyData.entries())
    .map(([monthKey, data]) => {
      const [year, month] = monthKey.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      };
    })
    .sort((a, b) => {
      const [aYear, aMonth] = a.month.split(" ");
      const [bYear, bMonth] = b.month.split(" ");
      const aDate = new Date(Date.parse(`${aMonth} 1, ${aYear}`));
      const bDate = new Date(Date.parse(`${bMonth} 1, ${bYear}`));
      return aDate.getTime() - bDate.getTime();
    });
}
