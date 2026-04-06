declare module "jsmediatags" {
  export interface PictureTag {
    format: string;
    data: number[] | Uint8Array;
  }

  export interface TagContainer {
    tags: Record<string, unknown>;
  }

  interface ReadCallbacks {
    onSuccess: (tag: TagContainer) => void;
    onError: (error: { type: string; info: string }) => void;
  }

  const jsmediatags: {
    read: (source: string | Blob, callbacks: ReadCallbacks) => void;
  };

  export default jsmediatags;
}
