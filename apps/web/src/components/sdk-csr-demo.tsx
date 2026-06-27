"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlbumsApi,
  PostsApi,
  UsersApi,
  createSdkClientContext,
} from "@repo/sdk";
import { handleUnauthorizedSdkResponse } from "@/security/security-token.client";
import { AppErrorFallback } from "./app-error-fallback";

type DemoStatus = "idle" | "loading" | "ready" | "error";

type JsonPlaceholderPost = {
  body: string;
  id: number;
  title: string;
  userId: number;
};

type JsonPlaceholderUser = {
  company: {
    name: string;
  };
  email: string;
  id: number;
  name: string;
  username: string;
};

type JsonPlaceholderAlbum = {
  id: number;
  title: string;
  userId: number;
};

const jsonPlaceholderBaseUrl =
  process.env.NEXT_PUBLIC_JSONPLACEHOLDER_BASE_URL ??
  "https://jsonplaceholder.typicode.com";

export function SdkCsrDemo() {
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [error, setError] = useState<unknown>(null);
  const [posts, setPosts] = useState<JsonPlaceholderPost[]>([]);
  const [users, setUsers] = useState<JsonPlaceholderUser[]>([]);
  const [albums, setAlbums] = useState<JsonPlaceholderAlbum[]>([]);

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
    void loadDemoData();
  }, []);

  async function loadDemoData() {
    try {
      setStatus("loading");
      setError(null);

      const [nextPosts, nextUsers, nextAlbums] = await Promise.all([
        postsApi.listPosts({}),
        usersApi.listUsers(),
        albumsApi.listAlbums({}),
      ]);

      setPosts(nextPosts.slice(0, 6));
      setUsers(nextUsers.slice(0, 4));
      setAlbums(nextAlbums.slice(0, 6));
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setError(error);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          CSR SDK demo
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950">
          Browser calls through packages/sdk
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          This page makes client-side SDK calls directly in the browser with an
          explicit base URL, so you can see the generated clients working outside
          server components too.
        </p>
      </section>

      <section className="mt-8 border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">SDK status</h2>
            <p className="mt-1 text-sm text-slate-600">
              Base URL: <code>{jsonPlaceholderBaseUrl}</code>
            </p>
          </div>
          <button
            className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900"
            onClick={() => void loadDemoData()}
            type="button"
          >
            Refresh SDK data
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 text-sm">
          <span
            className={
              status === "ready"
                ? "border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800"
                : status === "error"
                  ? "border border-rose-200 bg-rose-50 px-3 py-1 text-rose-800"
                  : "border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700"
            }
          >
            {status}
          </span>
          <span className="text-slate-600">
            The posts, users, and albums sections below are all fetched by the
            generated SDK in the browser.
          </span>
        </div>
        {error ? (
          <div className="mt-4">
            <AppErrorFallback error={error} title="SDK CSR demo failed" />
          </div>
        ) : null}
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">Posts section</h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              <code>PostsApi</code>
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {posts.map((post) => (
              <article key={post.id} className="border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-teal-700">
                  Post #{post.id} - User {post.userId}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-slate-950">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{post.body}</p>
              </article>
            ))}
            {status === "loading" ? (
              <p className="text-sm text-slate-500">Loading posts from the SDK...</p>
            ) : null}
          </div>
        </section>

        <section className="border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">Users section</h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              <code>UsersApi</code>
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {users.map((user) => (
              <article key={user.id} className="border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-teal-700">@{user.username}</p>
                <h3 className="mt-1 text-sm font-semibold text-slate-950">
                  {user.name}
                </h3>
                <p className="mt-1 text-sm text-slate-700">{user.email}</p>
                <p className="mt-2 text-sm text-slate-600">{user.company.name}</p>
              </article>
            ))}
            {status === "loading" ? (
              <p className="text-sm text-slate-500">Loading users from the SDK...</p>
            ) : null}
          </div>
        </section>

        <section className="border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">Albums section</h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              <code>AlbumsApi</code>
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {albums.map((album) => (
              <article key={album.id} className="border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-teal-700">
                  Album #{album.id} - User {album.userId}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-slate-950">
                  {album.title}
                </h3>
              </article>
            ))}
            {status === "loading" ? (
              <p className="text-sm text-slate-500">Loading albums from the SDK...</p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
