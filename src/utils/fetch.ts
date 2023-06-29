import { ParsedUrlQueryInput } from 'querystring';
import { stringify as stringifyParams } from 'querystring';

export type FetchOptions = {
  method?: string;
  data?: any;
  params?: ParsedUrlQueryInput;
  headers?: Record<string, any>;
};

export type FetchResult<TResult> = {
  response: Response;
  data: TResult;
};

export type MethodFetchOptions = {
  params?: ParsedUrlQueryInput;
  headers?: Record<string, any>;
};

const defaultHeaders: Record<string, any> = {
    'Content-Type': 'application/json',
  },
  middleware = {
    response: [] as Function[],
  };

const stringifyIt = (data?: any) => {
  if (!data) return data;

  try {
    return JSON.stringify(data);
  } catch {
    return undefined;
  }
};

const doFetch = async <TResult = any>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<TResult>> => {
  const headers = new Headers({
      ...defaultHeaders,
      ...options.headers,
    }),
    data =
      headers.has('Content-Type') &&
      headers.get('Content-Type') === 'application/json'
        ? stringifyIt(options.data)
        : options.data,
    queryString = options.params && stringifyParams(options.params),
    method = options.method ?? 'GET';

  const finalURL = queryString ? `${url}?${queryString}` : url;

  const response = await fetch(finalURL, {
    method,
    body: data,
    headers,
  });

  const middlewares = Object.hasOwn(options, 'isWithinMiddleware')
    ? []
    : middleware.response;

  try {
    const result = middlewares.reduce(
      (result, middleware) => {
        const newResult = middleware({
          request: {
            url,
            method,
            options,
          },
          ...result,
        });

        return newResult;
      },
      {
        response,
        data: await response.json(),
      }
    );

    return result;
  } catch {
    const result = middlewares.reduce(
      (result, middleware) => {
        const newResult = middleware({
          request: {
            url,
            method,
            options,
          },
          ...result,
        });

        return newResult;
      },
      {
        response,
        data: response.body as any,
      }
    );

    return result;
  }
};

const fetcher = Object.assign(doFetch, {
  get<TResult = void>(url: string, options?: MethodFetchOptions) {
    return doFetch<TResult>(url, {
      ...options,
      method: 'GET',
    });
  },
  post<TResult = void>(url: string, data?: any, options?: MethodFetchOptions) {
    return doFetch<TResult>(url, {
      ...options,
      method: 'POST',
      data,
    });
  },
  put<TResult = void>(url: string, data?: any, options?: MethodFetchOptions) {
    return doFetch<TResult>(url, {
      ...options,
      method: 'PUT',
      data,
    });
  },
  patch<TResult = void>(url: string, data?: any, options?: MethodFetchOptions) {
    return doFetch<TResult>(url, {
      ...options,
      method: 'PUT',
      data,
    });
  },
  delete<TResult = void>(url: string, options?: MethodFetchOptions) {
    return doFetch<TResult>(url, {
      ...options,
      method: 'DELETE',
    });
  },
  middleware<TResult = unknown, TNewResult = TResult>(
    type: 'response',
    callback: (
      context: {
        request: {
          url: string;
          method: string;
          options: FetchOptions;
        };
      } & FetchResult<TResult>
    ) => TNewResult
  ): void {
    middleware[type].push(callback);
  },
  headers(data: object) {
    Object.assign(defaultHeaders, data);
  },
});

fetcher.middleware('response', async ({ request, response, data }) => {
  const isOk = response.ok,
    isUnauthorized = response.status === 401,
    isRefreshing = request.url.endsWith('/api/refresh');

  if (isOk || !isUnauthorized || isRefreshing)
    return {
      response,
      data,
    };

  const middlewareOptions = {
    isWithinMiddleware: true,
  } as any;

  {
    const { data, response } = await fetcher.post<{ token: string }>(
      '/api/refresh',
      null,
      {
        ...middlewareOptions,
        headers: {
          Authorization: '',
        },
      }
    );

    fetcher.headers({
      Authorization: `Bearer ${data.token}`,
    });

    if (response.status === 401) {
      window.location.href = '/';
      return null;
    }

    return fetcher(request.url, {
      ...request.options,
      ...middlewareOptions,
    });
  }
});

export default fetcher;
