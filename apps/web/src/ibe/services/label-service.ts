import {
  createPrismicClient,
  getRepositoryName,
  getSharedEnvValue,
} from "@repo/cms/prismic";
import {
  localMessages,
  type FlightMessages,
} from "@/i18n/messages";
import { routing, type AppLocale } from "@/i18n/routing";
import { resolvePrismicLabels } from "../utils/resolve-prismic-labels";

export type LabelSource = "local" | "prismic";

const prismicLocaleMap: Record<AppLocale, string> = {
  en: "en-us",
  ja: "ja-jp",
};

export async function getIbeLabels(locale: AppLocale): Promise<FlightMessages> {
  const source = getServerLabelSource();

  console.log("[label-service] load:start", {
    locale,
    source,
  });

  if (source === "prismic") {
    return getIbeLabelsFromPrismic(locale);
  }

  console.log("[label-service] LOCAL LABELS HIT", {
    locale,
    messages: localMessages[locale],
  });

  return localMessages[locale];
}

export function getServerLabelSource(): LabelSource {
  return getSharedEnvValue("LABEL_SOURCE") === "prismic" ? "prismic" : "local";
}

export function resolveLocale(locale: string | undefined): AppLocale {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
}

async function getIbeLabelsFromPrismic(
  locale: AppLocale,
): Promise<FlightMessages> {
  const lang = prismicLocaleMap[locale] ?? prismicLocaleMap.en;
  const repositoryName = getRepositoryName();
  const client = createPrismicClient();

  console.log("[label-service] PRISMIC API HIT", {
    locale,
    lang,
    repositoryName,
  });

  try {
    const ibeDocument = (await client.getSingle("ibe", {
      lang,
    })) as {
      id: string;
      lang: string;
      data: Record<string, unknown>;
    };

    console.log("[label-service] IBE PARENT RESPONSE", {
      locale,
      ibeId: ibeDocument.id,
      ibeLang: ibeDocument.lang,
      ibeData: ibeDocument.data,
    });

    const childIds = Object.values(ibeDocument.data)
      .filter(isPrismicDocumentLink)
      .map((value) => value.id)
      .filter(Boolean);

    if (childIds.length > 0) {
      const childDocuments = (await client.getAllByIDs(childIds, {
        lang,
      })) as Array<{
        id: string;
        type: string;
        lang: string;
        data: Record<string, unknown>;
      }>;
      const childDocumentMap = Object.fromEntries(
        childDocuments.map((document) => [document.type, document]),
      );
      const flightSearch = childDocumentMap.flight_search;
      const flightSelect = childDocumentMap.flight_select;

      if (flightSearch && flightSelect) {
        console.log("[label-service] IBE CHILD DOCS RESOLVED", {
          locale,
          childTypes: childDocuments.map((document) => document.type),
        });

        const labels = resolvePrismicLabels(
          localMessages.en,
          childDocumentMap as Record<string, { data: Record<string, unknown> }>,
        );

        console.log("[label-service] MAPPED LABELS", {
          locale,
          labels,
        });

        return labels;
      }
    }

    console.warn("[label-service] IBE PARENT INCOMPLETE, falling back to direct child fetch", {
      locale,
      childIds,
    });
  } catch (error) {
    console.warn("[label-service] IBE PARENT FETCH FAILED, falling back to direct child fetch", {
      locale,
      message: error instanceof Error ? error.message : String(error),
    });
  }

  const [flightSearch, flightSelect, passenger] = await Promise.all([
    client.getSingle("flight_search", { lang }),
    client.getSingle("flight_select", { lang }),
    client.getSingle("passenger", { lang }).catch(() => undefined),
  ]);

  console.log("[label-service] PRISMIC RAW RESPONSE", {
    locale,
    flightSearchId: flightSearch.id,
    flightSearchLang: flightSearch.lang,
    flightSearchData: flightSearch.data,
    flightSelectId: flightSelect.id,
    flightSelectLang: flightSelect.lang,
    flightSelectData: flightSelect.data,
    passengerId: passenger?.id,
    passengerLang: passenger?.lang,
    passengerData: passenger?.data,
  });

  const labels = resolvePrismicLabels(localMessages.en, {
    flight_search: flightSearch as { data: Record<string, unknown> },
    flight_select: flightSelect as { data: Record<string, unknown> },
    ...(passenger
      ? {
          passenger: passenger as { data: Record<string, unknown> },
        }
      : {}),
  });

  console.log("[label-service] MAPPED LABELS", {
    locale,
    labels,
  });

  return labels;
}

function isPrismicDocumentLink(
  value: unknown,
): value is { id: string; type?: string; uid?: string | null } {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as { id?: unknown }).id === "string"
  );
}
