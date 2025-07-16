import { ENV_VAR } from "./app.config";

export const REDIS_CONNECTION_URL = `redis://${ENV_VAR.REDIS_HOST}:${ENV_VAR.REDIS_PORT}/${ENV_VAR.REDIS_DB}`;