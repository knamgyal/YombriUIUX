export type RepoErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "VALIDATION"
  | "NETWORK"
  | "UNKNOWN";

export type RepoError = {
  code: RepoErrorCode;
  message: string;
  details?: unknown;
};

export type RepoResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: RepoError };

export const ok = <T>(value: T): RepoResult<T> => ({ ok: true, value });
export const err = (error: RepoError): RepoResult<never> => ({ ok: false, error });
