/**
 * MTN MoMo API Type Definitions
 * Comprehensive interfaces for Collections, Disbursements, and Physical Tickets
 */

// ============================================================================
// Common Types
// ============================================================================

export interface MoMoResponse<T = any> {
  status: 'success' | 'error' | 'pending';
  statusCode: number;
  statusMessage?: string;
  data?: T;
  error?: MoMoError;
  timestamp: string;
}

export interface MoMoError {
  code: string;
  message: string;
  details?: Record<string, any>;
  transactionId?: string;
}

export interface MoMoParty {
  partyIdType: 'MSISDN' | 'EMAIL' | 'PARTY_CODE';
  partyId: string;
}

export interface CurrencyAmount {
  currency: 'EUR' | 'XOF' | 'USD' | string;
  amount: string | number;
}

// ============================================================================
// Collections (Payments Received)
// ============================================================================

export interface CollectionRequest {
  externalId: string;
  payer: MoMoParty;
  amount: string | number;
  currency: string;
  description: string;
  callbackUrl?: string;
  correlationId?: string;
  note?: string;
}

export interface CollectionRequestWithId extends CollectionRequest {
  requestId: string;
  timestamp: string;
}

export interface CollectionResponse {
  transactionId: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REJECTED';
  amount: number;
  currency: string;
  externalId: string;
  payer: MoMoParty;
  description: string;
  createdAt: string;
  updatedAt?: string;
  paymentMethod?: string;
  failureReason?: string;
}

export interface CollectionNotification {
  transactionId: string;
  externalId: string;
  amount: number;
  currency: string;
  payer: MoMoParty;
  status: 'SUCCESSFUL' | 'FAILED' | 'REJECTED';
  timestamp: string;
  transactionType: 'COLLECTION' | 'PAYMENT_RECEIVED';
  description?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export interface CollectionStatusResponse {
  transactionId: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REJECTED' | 'EXPIRED';
  amount: number;
  currency: string;
  externalId: string;
  payer: MoMoParty;
  createdAt: string;
  completedAt?: string;
  reason?: string;
}

// ============================================================================
// Disbursements (Payments Sent)
// ============================================================================

export interface DisbursementRequest {
  externalId: string;
  payee: MoMoParty;
  amount: string | number;
  currency: string;
  description: string;
  callbackUrl?: string;
  correlationId?: string;
  note?: string;
  reason?: 'REFUND' | 'SALARY' | 'TRANSFER' | 'PAYMENT' | string;
}

export interface DisbursementRequestWithId extends DisbursementRequest {
  requestId: string;
  timestamp: string;
}

export interface DisbursementResponse {
  transactionId: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REJECTED';
  amount: number;
  currency: string;
  externalId: string;
  payee: MoMoParty;
  description: string;
  createdAt: string;
  updatedAt?: string;
  reason?: string;
  failureReason?: string;
}

export interface DisbursementNotification {
  transactionId: string;
  externalId: string;
  amount: number;
  currency: string;
  payee: MoMoParty;
  status: 'SUCCESSFUL' | 'FAILED' | 'REJECTED';
  timestamp: string;
  transactionType: 'DISBURSEMENT' | 'PAYMENT_SENT';
  description?: string;
  reason?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export interface DisbursementStatusResponse {
  transactionId: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REJECTED' | 'EXPIRED';
  amount: number;
  currency: string;
  externalId: string;
  payee: MoMoParty;
  createdAt: string;
  completedAt?: string;
  reason?: string;
}

// ============================================================================
// Physical Tickets (QR Code / Payment Tickets)
// ============================================================================

export interface PhysicalTicketRequest {
  externalId: string;
  amount: string | number;
  currency: string;
  description: string;
  validityPeriod?: {
    startDate: string;
    endDate: string;
  };
  ticketType?: 'QR_CODE' | 'BARCODE' | 'REFERENCE_NUMBER';
  callbackUrl?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export interface PhysicalTicketResponse {
  ticketId: string;
  transactionId: string;
  externalId: string;
  amount: number;
  currency: string;
  status: 'ACTIVE' | 'EXPIRED' | 'USED' | 'CANCELLED';
  ticketCode: string;
  qrCodeUrl?: string;
  barcodeUrl?: string;
  ticketUrl?: string;
  validFrom: string;
  validUntil: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface PhysicalTicketValidationRequest {
  ticketId: string;
  ticketCode?: string;
  externalId?: string;
}

export interface PhysicalTicketValidationResponse {
  ticketId: string;
  externalId: string;
  isValid: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'USED' | 'CANCELLED' | 'INVALID';
  amount: number;
  currency: string;
  validFrom: string;
  validUntil: string;
  message?: string;
}

export interface PhysicalTicketRedemptionRequest {
  ticketId: string;
  ticketCode: string;
  payerId?: MoMoParty;
}

export interface PhysicalTicketRedemptionResponse {
  ticketId: string;
  transactionId: string;
  status: 'REDEEMED' | 'FAILED';
  amount: number;
  currency: string;
  redeemedAt: string;
  message?: string;
}

// ============================================================================
// Webhook Callbacks
// ============================================================================

export interface WebhookCallback {
  id: string;
  eventType: WebhookEventType;
  timestamp: string;
  eventId: string;
  resourceId?: string;
  data: WebhookPayload;
  signature?: string;
}

export type WebhookEventType =
  | 'collection.request.created'
  | 'collection.request.pending'
  | 'collection.request.successful'
  | 'collection.request.failed'
  | 'collection.request.rejected'
  | 'disbursement.request.created'
  | 'disbursement.request.pending'
  | 'disbursement.request.successful'
  | 'disbursement.request.failed'
  | 'disbursement.request.rejected'
  | 'ticket.created'
  | 'ticket.validated'
  | 'ticket.redeemed'
  | 'ticket.expired'
  | 'ticket.cancelled';

export type WebhookPayload =
  | CollectionNotification
  | DisbursementNotification
  | PhysicalTicketNotification
  | WebhookError;

export interface PhysicalTicketNotification {
  ticketId: string;
  transactionId?: string;
  externalId: string;
  status: 'CREATED' | 'ACTIVE' | 'EXPIRED' | 'USED' | 'REDEEMED' | 'CANCELLED';
  amount: number;
  currency: string;
  timestamp: string;
  transactionType: 'PHYSICAL_TICKET';
  message?: string;
  metadata?: Record<string, any>;
}

export interface WebhookError {
  error: true;
  code: string;
  message: string;
  transactionId?: string;
  timestamp: string;
}

export interface WebhookSignature {
  algorithm: 'SHA256' | 'SHA512' | 'HMAC_SHA256';
  timestamp: string;
  nonce: string;
  signature: string;
}

// ============================================================================
// Account & Wallet
// ============================================================================

export interface AccountBalanceResponse {
  balance: number;
  currency: string;
  accountId: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastUpdated: string;
}

export interface AccountInfoResponse {
  accountId: string;
  accountHolderName: string;
  accountType: 'MERCHANT' | 'INDIVIDUAL' | 'BUSINESS';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CLOSED';
  email?: string;
  phone?: string;
  createdAt: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'FAILED';
}

export interface WalletTransaction {
  transactionId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  currency: string;
  balance: number;
  description: string;
  timestamp: string;
  relatedTransactionId?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

// ============================================================================
// Batch Operations
// ============================================================================

export interface BatchDisbursementRequest {
  batchId: string;
  disbursements: DisbursementRequest[];
  callbackUrl?: string;
  correlationId?: string;
}

export interface BatchDisbursementResponse {
  batchId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
  totalAmount: number;
  currency: string;
  disbursementCount: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
  completedAt?: string;
  results?: DisbursementResponse[];
  errors?: Array<{ index: number; error: MoMoError }>;
}

export interface BatchDisbursementStatusResponse {
  batchId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
  totalAmount: number;
  currency: string;
  disbursementCount: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
  completedAt?: string;
  disbursements: Array<{
    index: number;
    transactionId?: string;
    externalId: string;
    status: string;
    error?: MoMoError;
  }>;
}

// ============================================================================
// Reconciliation
// ============================================================================

export interface ReconciliationRequest {
  startDate: string;
  endDate: string;
  transactionType?: 'COLLECTION' | 'DISBURSEMENT' | 'ALL';
  status?: 'ALL' | 'SUCCESSFUL' | 'FAILED' | 'PENDING';
  limit?: number;
  offset?: number;
}

export interface ReconciliationResponse {
  transactions: TransactionSummary[];
  totalCount: number;
  successCount: number;
  failureCount: number;
  totalAmount: number;
  currency: string;
  period: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
}

export interface TransactionSummary {
  transactionId: string;
  externalId: string;
  type: 'COLLECTION' | 'DISBURSEMENT' | 'PHYSICAL_TICKET';
  status: 'SUCCESSFUL' | 'FAILED' | 'PENDING' | 'REJECTED';
  amount: number;
  currency: string;
  party: MoMoParty;
  description?: string;
  timestamp: string;
  completedAt?: string;
  failureReason?: string;
}

// ============================================================================
// Configuration & API Setup
// ============================================================================

export interface MoMoApiConfig {
  environment: 'sandbox' | 'production';
  baseUrl: string;
  primaryKey: string;
  secondaryKey?: string;
  userId: string;
  xReferenceId?: string;
  apiVersion?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface MoMoApiHeaders {
  'X-Reference-Id': string;
  'Authorization': string;
  'X-Target-Environment': 'sandbox' | 'production';
  'Content-Type': 'application/json';
  'Accept': 'application/json';
}

// ============================================================================
// Request/Response Wrappers
// ============================================================================

export interface ApiRequestContext {
  requestId: string;
  timestamp: string;
  correlationId?: string;
  userId?: string;
  ipAddress?: string;
}

export interface ApiResponseContext {
  requestId: string;
  responseTime: number; // milliseconds
  timestamp: string;
}

export interface StandardApiRequest<T> {
  context: ApiRequestContext;
  payload: T;
}

export interface StandardApiResponse<T> {
  context: ApiResponseContext;
  status: 'success' | 'error' | 'pending';
  statusCode: number;
  statusMessage?: string;
  payload?: T;
  error?: MoMoError;
}
