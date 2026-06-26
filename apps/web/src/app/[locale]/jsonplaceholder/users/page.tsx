import { getJsonPlaceholderUsers } from "@/services/jsonplaceholder/users.service";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "JSONPlaceholder Users API",
    description: "Users fetched through the generated OpenAPI SDK.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function JsonPlaceholderUsersPage() {
  const users = await getJsonPlaceholderUsers();

  return (
    <main>
      <section>
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          JSONPlaceholder
        </p>
        <h1 style={{ fontSize: "32px", margin: "8px 0 12px" }}>Users API</h1>
        <p style={{ color: "#475569", margin: 0, maxWidth: "720px" }}>
          This page uses the generated OpenAPI SDK package through the generated{" "}
          <code>UsersApi</code> client.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        {users.map((user) => (
          <article
            key={user.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "18px",
            }}
          >
            <p style={{ color: "#0f766e", fontSize: "13px", margin: 0 }}>
              @{user.username}
            </p>
            <h2 style={{ fontSize: "20px", margin: "10px 0 4px" }}>
              {user.name}
            </h2>
            <p style={{ color: "#475569", margin: "0 0 10px" }}>{user.email}</p>
            <p style={{ color: "#475569", lineHeight: 1.5, margin: 0 }}>
              {user.company.name}
              <br />
              {user.address.city}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
