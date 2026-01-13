/**
 * MTN Mobile Money Integration Types
 * This module defines TypeScript interfaces and types for MTN Mobile Money API integration
 * Including transaction management, configuration, webhooks, and response handling
 */

/**
 * Transaction status enumeration
 * Represents the various states a transaction can be in
 */
export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  PROCESSING = 'PROCESSING',
  REJECTED = 'REJECTED',
}

/**
 * Transaction type enumeration
 * Represents the different types of transactions supported
 */
export enum TransactionType {
  COLLECTION = 'COLLECTION',
  DISBURSEMENT = 'DISBURSEMENT',
  TRANSFER = 'TRANSFER',
  PHYSICAL_TICKET = 'PHYSICAL_TICKET',
  REFUND = 'REFUND',
}

/**
 * MTN Mobile Money configuration interface
 * Contains all necessary configuration parameters for MTN MOMO API
 */
export interface MTNConfig {
  // API credentials
  subscriptionKey: string;
  apiKey: string;
  primaryKey: string;
  secondaryKey: string;

  // Account identifiers
  accountHolderMSISDN: string;
  accountHolderIdType: string;
  accountHolderIdValue: string;

  // API endpoints
  baseURL: string;
  collectionURL: string;
  disbursementURL: string;
  transferURL: string;

  // Timeout configurations (in milliseconds)
  requestTimeout: number;
  pollTimeout: number;

  // Retry configurations
  maxRetries: number;
  retryDelay: number;

  // Webhook configuration
  webhookURL: string;
  webhookAPIKey: string;

  // Environment
  environment: 'sandbox' | 'production';

  // Additional settings
  currency: string;
  locale: string;
  callbackHost: string;
}

/**
 * Collection request interface
 * Used when collecting money from customers
 */
export interface CollectionRequest {
  // Unique identifier for the transaction
  externalId: string;

  // Amount in the specified currency
  amount: number;
  currency: string;

  // Payer information
  payerMessage?: string;
  payerNote?: string;
  payerPhoneNumber: string;

  // Payee information (business/service provider)
  payeeNote?: string;

  // Callback information
  callbackUrl?: string;

  // Additional metadata
  referenceId?: string;
  metadata?: Record<string, unknown>;
  description?: string;
}

/**
 * Disbursement request interface
 * Used when disbursing money to customers
 */
export interface DisbursementRequest {
  // Unique identifier for the transaction
  externalId: string;

  // Amount in the specified currency
  amount: number;
  currency: string;

  // Recipient information
  recipientPartyId: string;
  recipientPartyIdType: 'MSISDN' | 'EMAIL' | 'PARTY_CODE';

  // Payment details
  payeeNote?: string;
  payerMessage?: string;

  // Callback information
  callbackUrl?: string;

  // Additional metadata
  referenceId?: string;
  metadata?: Record<string, unknown>;
  description?: string;
}

/**
 * Physical ticket request interface
 * Used for physical ticket transactions
 */
export interface PhysicalTicketRequest {
  // Unique identifier for the transaction
  externalId: string;

  // Ticket details
  ticketId: string;
  ticketType: string;
  ticketValue: number;
  currency: string;

  // Customer information
  customerPhoneNumber: string;
  customerName?: string;
  customerEmail?: string;

  // Ticket distribution
  distributorId: string;
  distributorPhoneNumber: string;

  // Callback information
  callbackUrl?: string;

  // Additional metadata
  referenceId?: string;
  metadata?: Record<string, unknown>;
  description?: string;
}

/**
 * MTN transaction interface
 * Represents a complete transaction record
 */
export interface MTNTransaction {
  // Unique identifiers
  id: string;
  externalId: string;
  transactionId?: string;

  // Transaction details
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;

  // Party information
  payerPhoneNumber?: string;
  payerName?: string;
  payeePhoneNumber?: string;
  payeeName?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Failure information
  failureReason?: string;
  errorCode?: string;

  // Additional information
  referenceId?: string;
  metadata?: Record<string, unknown>;
  description?: string;

  // Callback details
  callbackUrl?: string;
  callbackAttempts: number;
  lastCallbackAttempt?: Date;
}

/**
 * MTN webhook payload interface
 * Represents the payload sent by MTN MOMO in webhook callbacks
 */
export interface MTNWebhookPayload {
  // Transaction identification
  externalId: string;
  transactionId?: string;
  referenceId?: string;

  // Status information
  status: TransactionStatus;
  statusCode: string;
  statusMessage: string;

  // Transaction details
  amount?: number;
  currency?: string;
  transactionType?: TransactionType;

  // Party information
  partyId?: string;
  partyIdType?: string;
  partyName?: string;

  // Timestamp
  timestamp: string;

  // Additional data
  metadata?: Record<string, unknown>;
  reason?: string;
  errorDescription?: string;
}

/**
 * Token payload interface
 * Represents the JWT token payload for API authentication
 */
export interface TokenPayload {
  // Token identifiers
  jti: string;
  iss: string;
  sub: string;

  // Issued at and expiration
  iat: number;
  exp: number;

  // Scope and permissions
  scope: string[];
  aud: string;

  // Client information
  client_id: string;
  client_name?: string;

  // Additional claims
  [key: string]: unknown;
}

/**
 * MTN API response interface
 * Wraps all MTN API responses with consistent structure
 */
export interface MTNResponse<T = unknown> {
  // Response status
  success: boolean;
  statusCode: number;

  // Response message
  message: string;
  description?: string;

  // Response data
  data?: T;

  // Error information
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };

  // Request tracking
  requestId?: string;
  correlationId?: string;

  // Timestamp
  timestamp: string;

  // Additional metadata
  metadata?: Record<string, unknown>;
}

/**
 * Generic transaction response interface
 * Used for collection, disbursement, and other transaction responses
 */
export interface TransactionResponse {
  transactionId: string;
  externalId: string;
  status: TransactionStatus;
  amount: number;
  currency: string;
  createdAt: string;
  statusCode: string;
  statusMessage: string;
}

/**
 * Account balance response interface
 * Response from account balance inquiry
 */
export interface AccountBalanceResponse {
  balance: number;
  currency: string;
  availableBalance?: number;
  accountHolderName: string;
  timestamp: string;
}

/**
 * Transaction status check response interface
 * Response from checking transaction status
 */
export interface TransactionStatusResponse {
  transactionId: string;
  externalId: string;
  status: TransactionStatus;
  statusCode: string;
  statusMessage: string;
  amount?: number;
  currency?: string;
  partyId?: string;
  partyName?: string;
  timestamp: string;
}

/**
 * Wallet information response interface
 * Response containing wallet/account information
 */
export interface WalletInfoResponse {
  accountHolderMSISDN: string;
  accountHolderName: string;
  accountHolderId: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  registrationDate: string;
  lastTransactionDate?: string;
  totalTransactionCount: number;
}

/**
 * Request validation error interface
 * Used for API request validation
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * API error response interface
 * Extended error response from MTN API
 */
export interface APIError extends Error {
  statusCode: number;
  errorCode: string;
  errorMessage: string;
  requestId?: string;
  details?: ValidationError[] | Record<string, unknown>;
  timestamp: string;
}

/**
 * Pagination interface
 * Used for paginated API responses
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response interface
 * Wraps paginated results
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Transaction filter interface
 * Used for querying/filtering transactions
 */
export interface TransactionFilter {
  status?: TransactionStatus;
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  phoneNumber?: string;
  transactionId?: string;
  externalId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Webhook registration interface
 * Used for registering/updating webhooks
 */
export interface WebhookRegistration {
  url: string;
  events: TransactionType[];
  active: boolean;
  secret?: string;
  headers?: Record<string, string>;
  retryPolicy?: {
    maxRetries: number;
    retryDelayMs: number;
    backoffMultiplier: number;
  };
}

/**
 * Webhook event interface
 * Represents a webhook event that can be subscribed to
 */
export interface WebhookEvent {
  id: string;
  eventType: TransactionType;
  timestamp: string;
  data: MTNWebhookPayload;
  signature: string;
  retryCount: number;
  nextRetryTime?: string;
}
