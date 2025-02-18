import type { IChangeToken } from "./abstractions.js";

export class ConfigurationReloadToken implements IChangeToken {
  #abortController: AbortController = new AbortController();
  #activeChangeCallbacks = false;

  public get hasChanged(): boolean {
    return this.#abortController.signal.aborted;
  }

  public get activeChangeCallbacks(): boolean {
    return this.#activeChangeCallbacks;
  }

  public registerChangeCallback(callback: () => void) {
    const wrappedCallback = () => {
      callback();
      this.#activeChangeCallbacks = false;
    };

    this.#abortController.signal.addEventListener("abort", wrappedCallback);

    return {
      [Symbol.dispose]: () => {
        this.#abortController.signal.removeEventListener("abort", wrappedCallback);
      },
    };
  }

  public onReload(): void {
    this.#abortController.abort();
  }
}
