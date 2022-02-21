declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      NODE_ENV: string;
      POSTGRES_URL: string;
    }
  }
}

export {}
