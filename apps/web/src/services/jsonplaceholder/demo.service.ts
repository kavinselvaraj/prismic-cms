import { AlbumsApi, PostsApi, UsersApi } from "@repo/sdk";
import type { JsonPlaceholderDemoData } from "@/lib/jsonplaceholder-demo";
import { getAuthorizedSdkClientContextForRequest } from "@/security/security-token.server";

export async function getJsonPlaceholderDemoData(): Promise<JsonPlaceholderDemoData> {
  const context = await getAuthorizedSdkClientContextForRequest();
  const postsApi = context.getApi(PostsApi);
  const usersApi = context.getApi(UsersApi);
  const albumsApi = context.getApi(AlbumsApi);

  const [posts, users, albums] = await Promise.all([
    postsApi.listPosts({}),
    usersApi.listUsers(),
    albumsApi.listAlbums({}),
  ]);

  return {
    albums: albums.slice(0, 6),
    posts: posts.slice(0, 6),
    users: users.slice(0, 4),
  };
}
