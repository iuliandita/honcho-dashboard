declare global {
  namespace App {
    interface RuntimeConfig {
      workspaceId: string | null;
      version: string;
    }
    interface PageData {
      runtimeConfig: RuntimeConfig;
    }
    interface Error {
      message: string;
      status?: number;
      traceId?: string;
    }
  }
}

export {};
