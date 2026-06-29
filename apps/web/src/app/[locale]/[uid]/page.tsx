import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { getCmsPreviewState } from "@/prismic/preview";
import { SliceZone } from "@prismicio/react";
import {
  getContentPageBreadcrumb,
  getContentPageDocumentByUid,
  prismicSliceComponents,
} from "@repo/cms";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
    uid: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, uid } = await params;
  const page = await getContentPageDocumentByUid(
    { locale, uid },
    {
      fallbackLocales:
        locale === routing.defaultLocale ? [] : [routing.defaultLocale],
      preview: await getCmsPreviewState(),
    },
  );

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  const breadcrumb = getContentPageBreadcrumb(page);
  const fallbackTitle = breadcrumb.at(-1)?.label || page.uid || "Content Page";

  return {
    title: fallbackTitle,
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { locale, uid } = await params;
  const page = await getContentPageDocumentByUid(
    { locale, uid },
    {
      fallbackLocales:
        locale === routing.defaultLocale ? [] : [routing.defaultLocale],
      preview: await getCmsPreviewState(),
    },
  );

  if (!page) {
    notFound();
  }

  const breadcrumb = getContentPageBreadcrumb(page);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <li>
            <Link
              aria-label="Home"
              className="text-teal-700 transition hover:text-teal-800"
              href={`/${locale}`}
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3.75 10.5 12 3.75l8.25 6.75v8.25a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-4.5v6h-4.5a1.5 1.5 0 0 1-1.5-1.5V10.5Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
            </Link>
          </li>
          {breadcrumb.map((item, index) => {
            const isLast = index === breadcrumb.length - 1;

            return (
              <li
                key={`${item.label}-${index}`}
                className="flex items-center gap-2"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 text-slate-300"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="m7.5 4.5 5 5-5 5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                  />
                </svg>
                {item.href && !isLast ? (
                  <Link
                    className="font-medium text-teal-700 underline decoration-teal-300 underline-offset-4 hover:text-teal-800"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-900">{item.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <SliceZone
        components={prismicSliceComponents}
        slices={
          ((page.data as { slices?: unknown }).slices as Parameters<
            typeof SliceZone
          >[0]["slices"]) ?? []
        }
      />
    </main>
  );
}
