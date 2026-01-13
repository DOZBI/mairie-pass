/**
 * MTN MoMo Token Manager
 * Handles token generation, validation, and automatic refresh
 * with 1-minute token expiry
 */

interface TokenData {
  accessToken: string;
  tokenType: string;
  expiresIn: number; // in seconds
  issuedAt: number; // timestamp in milliseconds
}

interface TokenRefreshResult {
  success: boolean;
  token?: TokenData;
  error?: string;
}

interface TokenValidationResult {
  isValid: boolean;
  isExpiring: boolean;
  expiresIn: number; // remaining time in seconds
}

class MTNMoMoTokenManager {
  private token: TokenData | null = null;
  private readonly tokenExpiryTime = 60; // 1 minute in seconds
  private readonly refreshThresholdTime = 10; // Start refresh 10 seconds before expiry
  private refreshTimer: NodeJS.Timeout | null = null;
  private refreshPromise: Promise<TokenRefreshResult> | null = null;
  
  // API Configuration
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly tokenEndpoint: string;

  constructor(apiKey: string, apiSecret: string, tokenEndpoint: string) {
    if (!apiKey || !apiSecret) {
      throw new Error('API key and secret are required for MTN MoMo token manager');
    }
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.tokenEndpoint = tokenEndpoint;
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    // If no token exists, request a new one
    if (!this.token) {
      const result = await this.refreshToken();
      if (!result.success || !result.token) {
        throw new Error(result.error || 'Failed to obtain access token');
      }
      return result.token.accessToken;
    }

    // Check if token is still valid
    const validation = this.validateToken();
    
    // If token is valid and not expiring soon, return it
    if (validation.isValid && !validation.isExpiring) {
      return this.token.accessToken;
    }

    // If token is expiring or expired, refresh it
    if (validation.isExpiring || !validation.isValid) {
      const result = await this.refreshToken();
      if (!result.success || !result.token) {
        throw new Error(result.error || 'Failed to refresh access token');
      }
      return result.token.accessToken;
    }

    return this.token.accessToken;
  }

  /**
   * Refresh the access token
   */
  private async refreshToken(): Promise<TokenRefreshResult> {
    // If refresh is already in progress, return the same promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh operation
   */
  private async _performTokenRefresh(): Promise<TokenRefreshResult> {
    try {
      // Clear any existing refresh timer
      this.clearRefreshTimer();

      // Request new token from MTN MoMo API
      const newToken = await this.requestNewToken();
      
      // Store the new token
      this.token = newToken;

      // Schedule the next refresh
      this.scheduleNextRefresh();

      return {
        success: true,
        token: newToken,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Token refresh failed:', errorMessage);
      
      // Clear the token on failure
      this.token = null;
      
      return {
        success: false,
        error: `Token refresh failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Request a new token from MTN MoMo API
   */
  private async requestNewToken(): Promise<TokenData> {
    try {
      // Create Base64 encoded credentials (apiKey:apiSecret)
      const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');

      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'X-Target-Environment': 'production',
        },
      });

      if (!response.ok) {
        throw new Error(`Token request failed with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as Record<string, unknown>;

      // Validate response structure
      if (!data.access_token || typeof data.access_token !== 'string') {
        throw new Error('Invalid token response: missing or invalid access_token');
      }

      const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : this.tokenExpiryTime;

      return {
        accessToken: data.access_token as string,
        tokenType: (data.token_type as string) || 'Bearer',
        expiresIn,
        issuedAt: Date.now(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to request new token: ${errorMessage}`);
    }
  }

  /**
   * Validate if the current token is still valid
   */
  private validateToken(): TokenValidationResult {
    if (!this.token) {
      return {
        isValid: false,
        isExpiring: false,
        expiresIn: 0,
      };
    }

    const now = Date.now();
    const tokenAge = (now - this.token.issuedAt) / 1000; // Convert to seconds
    const remainingTime = this.token.expiresIn - tokenAge;

    return {
      isValid: remainingTime > 0,
      isExpiring: remainingTime <= this.refreshThresholdTime && remainingTime > 0,
      expiresIn: Math.max(0, Math.floor(remainingTime)),
    };
  }

  /**
   * Schedule the next token refresh
   */
  private scheduleNextRefresh(): void {
    // Schedule refresh at (tokenExpiryTime - refreshThresholdTime) seconds
    const refreshInMs = (this.token?.expiresIn || this.tokenExpiryTime - this.refreshThresholdTime) * 1000;
    
    this.refreshTimer = setTimeout(() => {
      this._performTokenRefresh().catch((error) => {
        console.error('Scheduled token refresh failed:', error);
      });
    }, refreshInMs);
  }

  /**
   * Clear the refresh timer
   */
  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Get token status information
   */
  getTokenStatus(): TokenValidationResult & { token?: string } {
    const validation = this.validateToken();
    return {
      ...validation,
      token: this.token?.accessToken,
    };
  }

  /**
   * Manually invalidate the token to force a refresh
   */
  invalidateToken(): void {
    this.token = null;
    this.clearRefreshTimer();
  }

  /**
   * Cleanup resources (should be called before shutdown)
   */
  destroy(): void {
    this.clearRefreshTimer();
    this.token = null;
    this.refreshPromise = null;
  }
}

export { MTNMoMoTokenManager, TokenData, TokenRefreshResult, TokenValidationResult };
