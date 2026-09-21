export interface DatabaseConfig { url: string; }
export function databaseConfigFromEnvironment(environment: NodeJS.ProcessEnv): DatabaseConfig { const url = environment.DATABASE_URL; if (!url) throw new Error('DATABASE_URL must be configured. Copy .env.example to .env for local development.'); return { url }; }
