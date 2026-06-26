import { getAuthorizedSdkClientContextForRequest } from "@/security/security-token.server";
import { UsersApi } from "@repo/sdk";

export async function getJsonPlaceholderUsers() {
  const context = await getAuthorizedSdkClientContextForRequest();
  const usersApi = context.getApi(UsersApi);

  return usersApi.listUsers();
}
