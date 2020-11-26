export type ProgressHandler = (bytes: number, bytesTotal: number) => void;
export type JSONData =
  | string
  | number
  | boolean
  | null
  | JSONData[]
  | {
      [key: string]: JSONData;
    };
type DLJQ = {
  url: string;
  type: 'json';
};
type DLAQ = {
  url: string;
  type: 'arraybuffer';
};
export type DownloadQuery = string | DLJQ | DLAQ;

type DLR<T> = {
  [K in keyof T]: Promise<T[K] extends DLJQ ? JSONData : ArrayBuffer>;
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
            : (query as DLAQ | DLJQ);

        if (typeof query == 'string')
          query = {
            url: query,
            type: 'arraybuffer',
          };
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
