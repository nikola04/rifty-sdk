export class RiftlyError<T extends string> extends Error {
    constructor(
        public override readonly name: T,
        public override readonly message: string,
        public readonly cause?: unknown,
    ) {
        super(message);
        this.name = name;
        Object.setPrototypeOf(this, RiftlyError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RiftlyError);
        }
    }
}
