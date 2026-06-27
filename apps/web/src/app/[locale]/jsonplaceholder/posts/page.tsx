import { getJsonPlaceholderPosts } from "@/services/jsonplaceholder/posts.service";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "JSONPlaceholder Posts API",
    description: "Posts fetched through the generated OpenAPI SDK.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function JsonPlaceholderPostsPage() {
  const posts = await getJsonPlaceholderPosts();

  return (
    <main>
      <section>
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          JSONPlaceholder
        </p>
        <h1 style={{ fontSize: "32px", margin: "8px 0 12px" }}>Posts API</h1>
        <p style={{ color: "#475569", margin: 0, maxWidth: "720px" }}>
          This page uses the generated OpenAPI SDK package through the generated{" "}
          <code>PostsApi</code> client.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        {posts.map((post) => (
          <article
            key={post.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "18px",
            }}
          >
            <p style={{ color: "#0f766e", fontSize: "13px", margin: 0 }}>
              Post #{post.id} - User {post.userId}
            </p>
            <h2 style={{ fontSize: "18px", margin: "10px 0" }}>
              {post.title}
            </h2>
            <p style={{ color: "#475569", lineHeight: 1.5, margin: 0 }}>
              {post.body}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
