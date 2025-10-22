/* eslint-disable */
const http = (() => {
  class ClientRequest {
    constructor(options, responseCallback) {
      this.options = options;
      this.responseCallback = responseCallback;
      this.bodyChunks = [];
      this.eventHandlers = { response: [], error: [] };
      if (typeof responseCallback === "function") {
        this.on("response", responseCallback);
      }
    }

    on(event, handler) {
      if (!this.eventHandlers[event]) this.eventHandlers[event] = [];
      this.eventHandlers[event].push(handler);
      return this;
    }

    write(chunk) {
      this.bodyChunks.push(chunk);
    }

    end() {
      const { method = "GET", headers = {} } = this.options;
      const protocol = this.options.protocol || "http:";
      const hostname =
        this.options.hostname || this.options.host || "localhost";
      const port = this.options.port ? `:${this.options.port}` : "";
      const path = this.options.path || "/";
      const url = this.options.href
        ? this.options.href
        : `${protocol}//${hostname}${port}${path}`;

      const emit = (event, ...args) => {
        if (this.eventHandlers[event]) {
          this.eventHandlers[event].forEach((fn) => fn(...args));
        }
      };

      const body =
        method === "GET" || method === "HEAD"
          ? undefined
          : this.bodyChunks.join("");

      fetch(url, { method, headers, body })
        .then(async (res) => {
          const text = await res.text();
          const response = {
            statusCode: res.status,
            headers: Object.fromEntries(res.headers.entries()),
            setEncoding: () => { },
            on: (event, handler) => {
              if (event === "data") handler(text);
              if (event === "end") handler();
            },
          };
          emit("response", response);
        })
        .catch((err) => {
          emit("error", err);
        });
    }
  }

  const normalizeArgs = (urlOrOptions, optionsOrCallback, maybeCallback) => {
    if (typeof urlOrOptions === "string") {
      if (typeof optionsOrCallback === "object") {
        return {
          options: { href: urlOrOptions, ...optionsOrCallback },
          callback: maybeCallback,
        };
      } else {
        return {
          options: { href: urlOrOptions },
          callback: optionsOrCallback,
        };
      }
    } else {
      return {
        options: urlOrOptions || {},
        callback: optionsOrCallback,
      };
    }
  };

  const request = (urlOrOptions, optionsOrCallback, maybeCallback) => {
    const { options, callback } = normalizeArgs(
      urlOrOptions,
      optionsOrCallback,
      maybeCallback,
    );
    return new ClientRequest(options, callback);
  };

  return { request };
})();

export default http;
