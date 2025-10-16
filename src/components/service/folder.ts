import { apiService } from './Api';

export interface FileUploadResult {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  error?: string;
}

export interface FileUploadOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  onSuccess?: (result: FileUploadResult) => void;
}

/**
 * Handle file selection and upload
 */
export class FileUploadHandler {
  private enableLogs = (import.meta.env.VITE_ENABLE_LOGS || '').toString().toLowerCase() === 'true' || import.meta.env.DEV;

  private log(...args: unknown[]) {
    if (this.enableLogs) {
      const ts = new Date().toISOString();
      // eslint-disable-next-line no-console
      console.log(`[fileUpload ${ts}]`, ...args);
    }
  }

  /**
   * Create and trigger file input dialog
   */
  selectFile(): Promise<File | null> {
    return new Promise((resolve) => {
      // Create file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      input.style.display = 'none';
      
      input.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0] || null;
        this.log('selectFile:onchange', file ? { name: file.name, size: file.size, type: file.type } : { canceled: true });
        document.body.removeChild(input);
        resolve(file);
      };

      input.oncancel = () => {
        document.body.removeChild(input);
        resolve(null);
      };

      document.body.appendChild(input);
      this.log('selectFile:openDialog');
      input.click();
    });
  }

  /**
   * Upload and process RFP file
   */
  async uploadAndProcessFile(
    file: File, 
    options: FileUploadOptions = {}
  ): Promise<FileUploadResult> {
    const { onProgress, onError, onSuccess } = options;

    try {
      // Validate file
      const validation = apiService.validateFile(file);
      if (!validation.isValid) {
        const error = validation.error || 'Invalid file';
        onError?.(error);
        this.log('uploadAndProcessFile:invalid', { error });
        return { success: false, error };
      }

      // Step 1: upload to get job id
      onProgress?.(10);
      this.log('uploadAndProcessFile:progress', { progress: 10, phase: 'uploading' });
      const uploadRes = await apiService.uploadRfp(file);
      if (!uploadRes.success || !uploadRes.jobId) {
        const error = uploadRes.error || 'Upload failed';
        onError?.(error);
        this.log('uploadAndProcessFile:uploadError', { error });
        return { success: false, error };
      }

      // Step 2: poll for status
      const pollIntervalMs = parseInt(String(import.meta.env.VITE_STATUS_POLL_INTERVAL_MS || ''), 10) || 3000;
      const maxWaitMs = parseInt(String(import.meta.env.VITE_STATUS_MAX_WAIT_MS || ''), 10) || 30 * 60 * 1000;
      const startedAt = Date.now();
      const jobId = uploadRes.jobId;
      let lastProgress = 10; // start at 10% after upload
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const status = await apiService.getJobStatus(jobId);
        if (!status.success) {
          const error = status.error || 'Failed to get job status';
          onError?.(error);
          this.log('uploadAndProcessFile:statusError', { error });
          return { success: false, error };
        }

        // Push progress if provided (or estimate)
        if (typeof status.progress === 'number') {
          lastProgress = Math.min(Math.max(status.progress, lastProgress), 99);
        } else {
          // Heuristic per status
          const statusKey = (status.status || 'processing').toLowerCase();
          const baseMap: Record<string, number> = {
            queued: 12,
            pending: 12,
            started: 15,
            parsing: 35,
            extracting: 55,
            generating: 75,
            processing: 20,
            completed: 100,
          };
          const base = baseMap[statusKey] ?? 20;
          // Gradually increase by 3% each poll, but never exceed 95% before completion
          lastProgress = Math.min(Math.max(lastProgress + 3, base), 95);
        }
        onProgress?.(lastProgress);

        if (status.status === 'completed') {
          break;
        }
        if (status.status === 'failed') {
          const error = status.message || 'Processing failed';
          onError?.(error);
          this.log('uploadAndProcessFile:failed', { error });
          return { success: false, error };
        }
        if (Date.now() - startedAt > maxWaitMs) {
          const error = 'Processing timed out';
          onError?.(error);
          this.log('uploadAndProcessFile:timeout');
          return { success: false, error };
        }
        await new Promise((r) => setTimeout(r, pollIntervalMs));
      }

      // Step 3: download result
      const downloadRes = await apiService.downloadJobResult(jobId);
      if (downloadRes.success && downloadRes.downloadUrl && downloadRes.filename) {
        onProgress?.(100);
        onSuccess?.(downloadRes);
        this.log('uploadAndProcessFile:success', { filename: downloadRes.filename });
        return {
          success: true,
          downloadUrl: downloadRes.downloadUrl,
          filename: downloadRes.filename,
        };
      }

      const error = downloadRes.error || 'Failed to download result';
      onError?.(error);
      this.log('uploadAndProcessFile:error', { error });
      return { success: false, error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError?.(errorMessage);
      this.log('uploadAndProcessFile:exception', { error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Complete workflow: select file, upload, and process
   */
  async selectAndProcessFile(options: FileUploadOptions = {}): Promise<FileUploadResult> {
    try {
      const file = await this.selectFile();
      
      if (!file) {
        return { success: false, error: 'No file selected' };
      }

      return await this.uploadAndProcessFile(file, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'File selection failed';
      options.onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}

// Export singleton instance
export const fileUploadHandler = new FileUploadHandler();
export default fileUploadHandler;

