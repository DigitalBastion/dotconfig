import type { IChangeToken } from "./abstractions.js";

export function createChangeToken(changeTokenProducer: () => IChangeToken | null, changeTokenConsumer: () => void) {
  return new ChangeTokenRegistration(changeTokenProducer, (callback) => callback(), changeTokenConsumer);
}

export function createChangeTokenWithState<TState>(
  changeTokenProducer: () => IChangeToken | null,
  changeTokenConsumer: (state: TState) => void,
  state: TState,
) {
  return new ChangeTokenRegistration(changeTokenProducer, changeTokenConsumer, state);
}

class ChangeTokenRegistration<TState> implements Disposable {
  public constructor(
    changeTokenProducer: () => IChangeToken | null,
    changeTokenConsumer: (state: TState) => void,
    state: TState,
  ) {
    this.#changeTokenProducer = changeTokenProducer;
    this.#changeTokenConsumer = changeTokenConsumer;
    this.#state = state;

    const token = changeTokenProducer();

    this.registerChangeTokenCallback(token);
  }

  #changeTokenProducer: () => IChangeToken | null;
  #changeTokenConsumer: (state: TState) => void;
  #state: TState;
  #disposable: Disposable | null = null;
  #disposedSentinel: Disposable = new NoopDisposable();

  private onChangeTokenFired() {
    const token = this.#changeTokenProducer();

    try {
      this.#changeTokenConsumer(this.#state);
    } finally {
      this.registerChangeTokenCallback(token);
    }
  }

  private registerChangeTokenCallback(token: IChangeToken | null) {
    if (token == null) {
      return;
    }

    const registration = token.registerChangeCallback(
      (s) => (s as ChangeTokenRegistration<TState>).onChangeTokenFired(),
      this,
    );

    if (token.hasChanged && token.activeChangeCallbacks) {
      registration[Symbol.dispose]();
      return;
    }

    this.setDisposable(registration);
  }

  private setDisposable(disposable: Disposable) {
    const current = this.#disposable;

    // If Dispose was called, then immediately dispose the disposable
    if (current === this.#disposedSentinel) {
      disposable[Symbol.dispose]();
      return;
    }

    // Otherwise, try to update the disposable.
    const previous = current;
    this.#disposable = disposable;

    if (previous === this.#disposedSentinel) {
      // The subscription was disposed so we dispose immediately and return.
      disposable[Symbol.dispose]();
    } else if (previous === current) {
      // We successfully assigned the _disposable field to disposable.
      return;
    } else {
      // Sets can never overlap with other SetDisposable calls so we should never get into this situation.
      throw new Error("Somebody else set the _disposable field.");
    }
  }

  [Symbol.dispose](): void {
    this.#disposable?.[Symbol.dispose]();
    this.#disposable = this.#disposedSentinel;
  }
}

class NoopDisposable implements Disposable {
  [Symbol.dispose](): void {
    // Noop
  }
}
