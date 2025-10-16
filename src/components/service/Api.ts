// API service for RFP processing
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ProcessRfpResponse extends ApiResponse {
  downloadUrl?: string;
  filename?: string;
}

export interface UploadResponse extends ApiResponse {
  jobId?: string;
}

export interface JobStatusResponse extends ApiResponse {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  // Optional backend-provided fields
  progress?: number; // 0-100 if provided by backend
  message?: string;
}

class ApiService {
  private baseUrl: string;
  private enableLogs: boolean;

  constructor() {
    // Use environment variable or default to localhost:8000
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://allvy-rfp-pythonservice-ang2cfbna2dahmc8.centralindia-01.azurewebsites.net';
    this.enableLogs = (import.meta.env.VITE_ENABLE_LOGS || '').toString().toLowerCase() === 'true' || import.meta.env.DEV;
  }

  private log(...args: unknown[]) {
    if (this.enableLogs) {
      const ts = new Date().toISOString();
      // eslint-disable-next-line no-console
      console.log(`[apiService ${ts}]`, ...args);
    }
  }

  /**
   * Upload RFP PDF to start async processing. Returns a job id.
   */
  async uploadRfp(file: File): Promise<UploadResponse> {
    try {
      this.log('uploadRfp:start', { name: file.name, size: file.size, type: file.type, baseUrl: this.baseUrl });
      const formData = new FormData();
      formData.append('file', file);

      const defaultTimeoutMs = 5 * 60 * 1000; // 5 minutes
      const timeoutMs = parseInt(String(import.meta.env.VITE_API_TIMEOUT_MS || ''), 10) || defaultTimeoutMs;
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(new DOMException('Timeout', 'AbortError')), timeoutMs);

      const endpoint = import.meta.env.VITE_API_UPLOAD_URL 
        || (typeof window !== 'undefined' && window.location.origin.includes('localhost') ? '/api-upload/' : `${this.baseUrl}/process-rfp/`);
      this.log('uploadRfp:request', { endpoint });
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        this.log('uploadRfp:httpError', { status: response.status, errorText });
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      const jobId = data.job_id || data.jobId || data.id;
      if (!jobId) {
        this.log('uploadRfp:missingJobId', data);
        return { success: false, error: 'Upload succeeded but job id not returned' };
      }

      const result = { success: true, jobId } as const;
      this.log('uploadRfp:success', result);
      return result;
    } catch (error) {
      this.log('uploadRfp:exception', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload RFP file',
      };
    }
  }

  /**
   * Get async job status by id
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    try {
      const endpointBase = import.meta.env.VITE_API_STATUS_URL_BASE 
        || (typeof window !== 'undefined' && window.location.origin.includes('localhost') ? '/api-status/' : `${this.baseUrl}/status/`);
      const endpoint = `${endpointBase}${encodeURIComponent(jobId)}`;
      this.log('getJobStatus:request', { endpoint, jobId });
      const response = await fetch(endpoint, { method: 'GET' });
      if (!response.ok) {
        const errorText = await response.text();
        this.log('getJobStatus:httpError', { status: response.status, errorText });
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }
      const data = await response.json();
      const status = (data.status || '').toLowerCase();
      const normalized: JobStatusResponse = {
        success: true,
        status: status as JobStatusResponse['status'],
        jobId: data.job_id || data.jobId || jobId,
        progress: typeof data.progress === 'number' ? data.progress : undefined,
        message: data.message,
      };
      this.log('getJobStatus:success', normalized);
      return normalized;
    } catch (error) {
      this.log('getJobStatus:exception', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get job status',
      };
    }
  }

  /**
   * Download the generated Excel for a completed job
   */
  async downloadJobResult(jobId: string): Promise<ProcessRfpResponse> {
    try {
      const endpointBase = import.meta.env.VITE_API_DOWNLOAD_URL_BASE 
        || (typeof window !== 'undefined' && window.location.origin.includes('localhost') ? '/api-download/' : `${this.baseUrl}/download/`);
      const endpoint = `${endpointBase}${encodeURIComponent(jobId)}`;
      this.log('downloadJobResult:request', { endpoint, jobId });
      const response = await fetch(endpoint, { method: 'GET' });

      if (!response.ok) {
        const errorText = await response.text();
        this.log('downloadJobResult:httpError', { status: response.status, errorText });
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        let filename = 'rfp_analysis.xlsx';
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
        const result = { success: true, downloadUrl, filename } as const;
        this.log('downloadJobResult:success', { filename, size: blob.size });
        return result;
      }

      // If backend returns JSON here, treat it as error/info
      const data = await response.json();
      return { success: false, error: data.error || data.message || 'Unexpected response while downloading' };
    } catch (error) {
      this.log('downloadJobResult:exception', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to download job result',
      };
    }
  }
  /**
   * Process RFP PDF file and get Excel analysis
   * @param file - The PDF file to process
   * @returns Promise with download URL and filename
   */
  async processRfp(file: File): Promise<ProcessRfpResponse> {
    // Backward-compatible wrapper that uses the new 3-step flow
    try {
      // Step 1: upload to get job id
      const upload = await this.uploadRfp(file);
      if (!upload.success || !upload.jobId) {
        return { success: false, error: upload.error || 'Upload failed' };
      }

      const jobId = upload.jobId;

      // Step 2: poll for completion
      const pollIntervalMs = parseInt(String(import.meta.env.VITE_STATUS_POLL_INTERVAL_MS || ''), 10) || 3000;
      const maxWaitMs = parseInt(String(import.meta.env.VITE_STATUS_MAX_WAIT_MS || ''), 10) || 30 * 60 * 1000; // 30 minutes
      const startedAt = Date.now();

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const status = await this.getJobStatus(jobId);
        if (!status.success) {
          return { success: false, error: status.error || 'Failed to get job status' };
        }
        // UI progress is handled outside; keep API pure
        if (status.status === 'completed') {
          break;
        }
        if (status.status === 'failed') {
          return { success: false, error: status.message || 'Processing failed' };
        }
        if (Date.now() - startedAt > maxWaitMs) {
          return { success: false, error: 'Processing timed out' };
        }
        await new Promise((r) => setTimeout(r, pollIntervalMs));
      }

      // Step 3: download result
      return await this.downloadJobResult(jobId);
    } catch (error) {
      this.log('processRfp:exception', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to process RFP file' };
    }
  }

  /**
   * Download file from blob URL
   * @param downloadUrl - The blob URL to download
   * @param filename - The filename for the download
   */
  downloadFile(downloadUrl: string, filename: string): void {
    this.log('downloadFile', { filename, downloadUrl });
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);
  }

  /**
   * Validate file before upload
   * @param file - The file to validate
   * @returns Validation result
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf') {
      return {
        isValid: false,
        error: 'Please upload a PDF file only.',
      };
    }

    // Check file size (limit to 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 50MB.',
      };
    }

    return { isValid: true };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;


