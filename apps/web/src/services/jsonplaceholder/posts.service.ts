import { getAuthorizedSdkClientContextForRequest } from "@/security/security-token.server";
import { PostsApi } from "@repo/sdk";

export async function getJsonPlaceholderPosts() {
  const context = await getAuthorizedSdkClientContextForRequest();
  const postsApi = context.getApi(PostsApi);
  const posts = await postsApi.listPosts({});

  return posts.slice(0, 12);
}
