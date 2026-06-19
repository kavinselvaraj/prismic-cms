"use client";

import { createQueryClient } from "@/api-client/query-client";
import { store } from "@/store";
import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ReduxProvider>
  );
}
