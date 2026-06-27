"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  AlbumsApi,
  PostsApi,
  UsersApi,
  createSdkClientContext,
} from "@repo/sdk";
import { AppErrorFallback } from "./app-error-fallback";
import type { JsonPlaceholderDemoData } from "@/lib/jsonplaceholder-demo";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { handleUnauthorizedSdkResponse } from "@/security/security-token.client";
import {
  selectJsonPlaceholderCsrDemoEntry,
  selectJsonPlaceholderSsrDemoEntry,
  setJsonPlaceholderDemoData,
  setJsonPlaceholderDemoError,
  setJsonPlaceholderDemoLoading,
} from "@/store/slices/jsonplaceholder-demo.slice";

type SdkCsrDemoProps = {
  serverSnapshot?: JsonPlaceholderDemoData;
};

const jsonPlaceholderBaseUrl =
  process.env.NEXT_PUBLIC_JSONPLACEHOLDER_BASE_URL ??
  "https://jsonplaceholder.typicode.com";

export function SdkCsrDemo({ serverSnapshot }: SdkCsrDemoProps) {
  const dispatch = useAppDispatch();
  const csrDemoEntry = useAppSelector(selectJsonPlaceholderCsrDemoEntry);
  const ssrDemoEntry = useAppSelector(selectJsonPlaceholderSsrDemoEntry);

  const { albumsApi, postsApi, usersApi } = useMemo(() => {
    const sdkContext = createSdkClientContext({
      baseUrl: jsonPlaceholderBaseUrl,
      onUnauthorized: handleUnauthorizedSdkResponse,
    });

    return {
      albumsApi: sdkContext.getApi(AlbumsApi),
      postsApi: sdkContext.getApi(PostsApi),
      usersApi: sdkContext.getApi(UsersApi),
    };
  }, []);

  useEffect(() => {
    if (!serverSnapshot) {
      return;
    }

    dispatch(
      setJsonPlaceholderDemoData({
        data: serverSnapshot,
        source: "ssr",
      }),
    );
  }, [dispatch, serverSnapshot]);

  const loadDemoData = useCallback(async () => {
    try {
      dispatch(setJsonPlaceholderDemoLoading({ source: "csr" }));

      const [nextPosts, nextUsers, nextAlbums] = await Promise.all([
        postsApi.listPosts({}),
        usersApi.listUsers(),
        albumsApi.listAlbums({}),
      ]);

      dispatch(
        setJsonPlaceholderDemoData({
          data: {
            albums: nextAlbums.slice(0, 6),
            posts: nextPosts.slice(0, 6),
            users: nextUsers.slice(0, 4),
          },
          source: "csr",
        }),
      );
    } catch (error) {
      dispatch(
        setJsonPlaceholderDemoError({
          error: error instanceof Error ? error.message : "SDK CSR demo failed",
          source: "csr",
        }),
      );
    }
  }, [albumsApi, dispatch, postsApi, usersApi]);

  useEffect(() => {
    void loadDemoData();
  }, [loadDemoData]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          SDK API demo
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950">
          Redux-backed CSR and SSR SDK calls
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          This page stores both server-rendered and browser-fetched API values
          in Redux so the same component can show the two execution paths side by
          side.
        </p>
      </section>

      <section className="mt-8 border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              CSR Redux state
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Base URL: <code>{jsonPlaceholderBaseUrl}</code>
            </p>
          </div>
          <button
            className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900"
            onClick={() => void loadDemoData()}
            type="button"
          >
            Refresh CSR data
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 text-sm">
          <span
            className={
              csrDemoEntry.status === "ready"
                ? "border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800"
                : csrDemoEntry.status === "error"
                  ? "border border-rose-200 bg-rose-50 px-3 py-1 text-rose-800"
                  : csrDemoEntry.status === "loading"
                    ? "border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800"
                    : "border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700"
            }
          >
            {csrDemoEntry.status}
          </span>
          <span className="text-slate-600">
            The CSR and SSR snapshots below both live in Redux.
          </span>
        </div>

        {csrDemoEntry.error ? (
          <div className="mt-4">
            <AppErrorFallback
              error={new Error(csrDemoEntry.error)}
              title="SDK CSR demo failed"
            />
          </div>
        ) : null}
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">
              SSR Redux snapshot
            </h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              <code>server-rendered</code>
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {ssrDemoEntry.status === "ready"
              ? "This data was fetched on the server and then hydrated into Redux."
              : "No server snapshot loaded yet."}
          </p>

          <div className="mt-4 grid gap-3">
            {ssrDemoEntry.data?.posts.map((post) => (
              <article
                key={post.id}
                className="border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-xs font-semibold text-teal-700">
                  Post #{post.id} - User {post.userId}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-slate-950">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {post.body}
                </p>
              </article>
            ))}
            {ssrDemoEntry.data?.users.map((user) => (
              <article
                key={user.id}
                className="border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-xs font-semibold text-teal-700">
                  @{user.username}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-slate-950">
                  {user.name}
                </h3>
                <p className="mt-1 text-sm text-slate-700">{user.email}</p>
                <p className="mt-2 text-sm text-slate-600">{user.company.name}</p>
              </article>
            ))}
            {ssrDemoEntry.data?.albums.map((album) => (
              <article
                key={album.id}
                className="border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-xs font-semibold text-teal-700">
                  Album #{album.id} - User {album.userId}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-slate-950">
                  {album.title}
                </h3>
              </article>
            ))}
            {!ssrDemoEntry.data ? (
              <p className="text-sm text-slate-500">
                No SSR data available yet.
              </p>
            ) : null}
          </div>
        </section>

        <section className="border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">
              CSR Redux snapshot
            </h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              <code>browser SDK</code>
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {csrDemoEntry.status === "loading"
              ? "Loading CSR data from the browser SDK..."
              : csrDemoEntry.status === "ready"
                ? "CSR data is stored in Redux and can be reused across the app."
                : "Refresh to load the CSR data."}
          </p>

          <div className="mt-4 grid gap-3">
            {csrDemoEntry.data?.posts.map((post) => (
              <article
                key={post.id}
                className="border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-xs font-semibold text-teal-700">
                  Post #{post.id} - User {post.userId}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-slate-950">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {post.body}
                </p>
              </article>
            ))}
            {csrDemoEntry.data?.users.map((user) => (
              <article
                key={user.id}
                className="border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-xs font-semibold text-teal-700">
                  @{user.username}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-slate-950">
                  {user.name}
                </h3>
                <p className="mt-1 text-sm text-slate-700">{user.email}</p>
                <p className="mt-2 text-sm text-slate-600">{user.company.name}</p>
              </article>
            ))}
            {csrDemoEntry.data?.albums.map((album) => (
              <article
                key={album.id}
                className="border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-xs font-semibold text-teal-700">
                  Album #{album.id} - User {album.userId}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-slate-950">
                  {album.title}
                </h3>
              </article>
            ))}
            {!csrDemoEntry.data ? (
              <p className="text-sm text-slate-500">
                No CSR data stored yet.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
