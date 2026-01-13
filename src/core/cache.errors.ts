import { RiftlyError } from "@shared/error/error";

type CacheErrorName = "GET_CACHE" | "SET_CACHE" | "DELETE_CACHE";

export class CacheError extends RiftlyError<CacheErrorName> {}
