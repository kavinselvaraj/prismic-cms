export type JsonPlaceholderPost = {
  body: string;
  id: number;
  title: string;
  userId: number;
};

export type JsonPlaceholderUser = {
  company: {
    name: string;
  };
  email: string;
  id: number;
  name: string;
  username: string;
};

export type JsonPlaceholderAlbum = {
  id: number;
  title: string;
  userId: number;
};

export type JsonPlaceholderDemoData = {
  albums: JsonPlaceholderAlbum[];
  posts: JsonPlaceholderPost[];
  users: JsonPlaceholderUser[];
};

export type JsonPlaceholderDemoSource = "csr" | "ssr";

export type JsonPlaceholderDemoStatus = "idle" | "loading" | "ready" | "error";

export type JsonPlaceholderDemoEntry = {
  data: JsonPlaceholderDemoData | null;
  error: string | null;
  loadedAt: number | null;
  status: JsonPlaceholderDemoStatus;
};

export type JsonPlaceholderDemoState = {
  csr: JsonPlaceholderDemoEntry;
  lastUpdatedSource: JsonPlaceholderDemoSource | null;
  ssr: JsonPlaceholderDemoEntry;
};

export function createEmptyJsonPlaceholderDemoEntry(): JsonPlaceholderDemoEntry {
  return {
    data: null,
    error: null,
    loadedAt: null,
    status: "idle",
  };
}

export function createEmptyJsonPlaceholderDemoState(): JsonPlaceholderDemoState {
  return {
    csr: createEmptyJsonPlaceholderDemoEntry(),
    lastUpdatedSource: null,
    ssr: createEmptyJsonPlaceholderDemoEntry(),
  };
}
