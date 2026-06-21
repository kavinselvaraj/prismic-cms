import { api } from "@/api-client/axios";
import { backendEndpoints } from "@/api-client/endpoints";
import type { SearchRoute, SearchRoutesRequest } from "@/types/search-routes";

type JsonPlaceholderPost = {
  id: number;
  userId: number;
  title: string;
};

export async function searchRoutesServerService(
  payload: SearchRoutesRequest,
): Promise<SearchRoute[]> {
  console.log("[server-service] GET", backendEndpoints.searchRoutes, {
    apiSource: process.env.API_SOURCE === "backend" ? "backend" : "mock",
    runtime: "server",
  });

  const { data } = await api.get<Array<JsonPlaceholderPost | SearchRoute>>(
    backendEndpoints.searchRoutes,
  );

  if (isSearchRouteList(data)) {
    console.log("[server-service] RESPONSE existing SearchRoute[]", {
      routeCount: data.length,
      runtime: "server",
    });
    return data;
  }

  const posts = data as JsonPlaceholderPost[];

  const mappedRoutes = posts
    .slice(0, 5)
    .map((post) => mapPostToSearchRoute(post, payload));

  console.log("[server-service] RESPONSE mapped JsonPlaceholder posts", {
    postCount: posts.length,
    routeCount: mappedRoutes.length,
    runtime: "server",
  });

  return mappedRoutes;
}

function isSearchRouteList(
  routes: Array<JsonPlaceholderPost | SearchRoute>,
): routes is SearchRoute[] {
  return routes.every((route) => "departureDateTime" in route);
}

function mapPostToSearchRoute(
  post: JsonPlaceholderPost,
  payload: SearchRoutesRequest,
): SearchRoute {
  return {
    id: String(post.id),
    origin: payload.origin,
    destination: payload.destination,
    departureDateTime: `${payload.departureDate}T10:00:00+00:00`,
    arrivalDateTime: `${payload.departureDate}T12:00:00+00:00`,
    carrierCode: post.title.slice(0, 2).toUpperCase(),
    flightNumber: String(100 + post.id),
    price: {
      amount: 500 + post.userId * 25,
      currency: "USD",
    },
  };
}
