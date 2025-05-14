export function request<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  return fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

interface AsyncFuncRetryOptions {
  retries?: number;
  delay?: number;
  stop?: () => boolean;
}
export function AsyncFuncRetry<T, U extends any[]>(
  func: (...args: U) => Promise<T>,
  args: U,
  options?: AsyncFuncRetryOptions
): Promise<T> {
  const { retries = 3, delay = 1000, stop = () => false } = options || {};

  return new Promise((resolve, reject) => {
    func(...args)
      .then(resolve)
      .catch((error) => {
        if (retries > 0 && !stop()) {
          setTimeout(() => {
            AsyncFuncRetry(func, args, {
              ...options,
              retries: retries - 1,
            })
              .then(resolve)
              .catch(reject);
          }, delay);
        } else {
          reject(error);
        }
      });
  });
}
