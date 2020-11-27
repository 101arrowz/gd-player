export type ProgressHandler = (bytes: number, bytesTotal: number) => void;
export type DownloadQuery = string | {
  url: string;
  type: 'text' | 'arraybuffer';
};

type DLR<T> = {
  [K in keyof T]: Promise<T[K] extends { type: 'text' } ? string : ArrayBuffer>;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOP = () => {};

export default <T extends DownloadQuery[]>(
  urls: [...T],
  onProgress: ProgressHandler = NOP
): DLR<T> => {
  let bytesTotal = 0,
    bytesReceived = 0;
  return urls.map(
    (query) =>
      new Promise((res, rej) => {
        const { url, type } =
          typeof query == 'string'
            ? {
                url: query,
                type: 'arraybuffer' as const,
              }
            : query as Exclude<DownloadQuery, string>
        const xhr = new XMLHttpRequest();
        let last = 0;
        xhr.onprogress = (ev) => {
          const add = ev.loaded - last;
          if (!ev.lengthComputable) bytesTotal += add;
          onProgress((bytesReceived += add), bytesTotal);
          last = ev.loaded;
        }
        xhr.onreadystatechange = () => {
          if (xhr.readyState == xhr.HEADERS_RECEIVED) {
            +xhr.getResponseHeader('Content-Length')!
            bytesTotal += +xhr.getResponseHeader('Content-Length')!;
          }
        };
        xhr.onload = () => res(xhr.response);
        xhr.onerror = () => rej(xhr.statusText);
        xhr.open('GET', url, true);
        xhr.send();
        xhr.responseType = type;
      })
  ) as DLR<T>;
};
