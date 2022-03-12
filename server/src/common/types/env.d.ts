declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      NODE_ENV: string;
      POSTGRES_URL: string;
      CLD_CLOUD_NAME: string;
      CLD_API_KEY: string;
      CLD_API_SECRET: string;
    }
  }
}

export {}
