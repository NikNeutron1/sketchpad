export class ReadyResource<T> {
  private value: T;
  private readyPromise: Promise<T>;
  private readyResolve: (valu: T) => void;

  constructor() {
    this.readyPromise = new Promise<T>((r) => (this.readyResolve = r));
  }

  static fromValue<T>(value: T): ReadyResource<T> {
    const resource = new ReadyResource<T>();
    resource.resolve(value);
    return resource;
  }

  ifPromised(handler: (value: T) => void): boolean {
    if (this.readyPromise) {
      this.readyPromise.then((result) => handler(result));
      return true;
    }
    return false;
  }

  resolve(value: T = null) {
    this.value = value;
    if (this.readyPromise) {
      this.readyResolve(value);
      this.readyPromise = null;
      this.readyResolve = null;
    }
  }

  async getValue(): Promise<T> {
    return this.readyPromise ? await this.readyPromise : this.value;
  }

  getPresent(): T {
    return this.value;
  }
}
