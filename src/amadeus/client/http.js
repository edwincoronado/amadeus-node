import { RESTMessageV2 } from '@servicenow/glide/sn_ws';

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

      try {
        const request = new RESTMessageV2();
        request.setEndpoint(url);
        request.setHttpMethod(method);
        for (const [key, value] of Object.entries(headers)) {
          request.setRequestHeader(key.toLowerCase(), value);
        }
        if (body) {
          request.setRequestBody(body);
        }
        const res = request.execute();
        const text = res.getBody();
        const resHeaders = res.getAllHeaders().reduce((list, header) => {
          list[header.name.toLowerCase()] = header.value
          return list;
        }, {});
        const response = {
          statusCode: res.getStatusCode(),
          headers: resHeaders,
          setEncoding: () => {},
          on: (event, handler) => {
            if (event === "data") handler(text);
            if (event === "end") handler();
          },
        };
        emit("response", response);
      } catch (e) {
        emit("error", e);
      }
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
