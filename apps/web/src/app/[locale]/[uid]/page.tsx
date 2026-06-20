import Link from "next/link";
import { asText } from "@prismicio/client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrismicRichText } from "@prismicio/react";
import { getContentPageByUid } from "@repo/cms";
import type { AppLocale } from "@/i18n/routing";

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
  const page = await getContentPageByUid({ locale, uid });

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: page.title,
    description: asText(page.description) || undefined,
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { locale, uid } = await params;
  const page = await getContentPageByUid({ locale, uid });

  if (!page) {
    notFound();
  }

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
          {page.breadcrumb.map((item, index) => {
            const isLast = index === page.breadcrumb.length - 1;

            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2">
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

      <section className="border-b border-slate-200 pb-8">
        {page.eyebrow ? (
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-700">
            {page.eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl text-4xl font-semibold text-slate-950">
          {page.title}
        </h1>
        {page.pageKind !== "faq_detail" ? (
          <div className="prose prose-slate mt-4 max-w-3xl">
            <PrismicRichText field={page.description} />
          </div>
        ) : null}
      </section>

      {page.pageKind === "faq_landing" ? (
        <section className="mt-10 border-t border-slate-200 pt-10">
          <h2 className="mb-6 text-2xl font-medium text-slate-950">
            About Reservations
          </h2>
          <div className="flex flex-wrap gap-x-7 gap-y-5 text-[17px]">
            {page.categoryLinks.map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                className="font-medium text-teal-700 underline decoration-teal-300 underline-offset-4 hover:text-teal-800"
                href={item.href || "#"}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {page.pageKind === "faq_category" ? (
        <section className="mt-10 space-y-0 border-t border-slate-200">
          {page.faqs.map((item) => (
            <Link
              key={`${item.question}-${item.href}`}
              className="flex items-center justify-between border-b border-slate-200 py-7 text-lg text-slate-950 transition hover:text-teal-700"
              href={item.href || "#"}
            >
              <span>{item.question}</span>
              <span
                aria-hidden="true"
                className="text-3xl leading-none text-teal-700"
              >
                &#8250;
              </span>
            </Link>
          ))}
        </section>
      ) : null}

      {page.pageKind === "faq_detail" ? (
        <section className="mt-10">
          <div className="prose prose-slate max-w-3xl text-lg leading-8">
            <PrismicRichText field={page.description} />
          </div>
          {page.detailCtaLabel && page.detailCtaHref ? (
            <div className="mt-14 flex justify-center">
              <Link
                className="inline-flex min-h-16 min-w-[27rem] items-center justify-center rounded-md bg-emerald-700 px-8 text-center text-2xl font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-800"
                href={page.detailCtaHref}
              >
                {page.detailCtaLabel}
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      {!page.pageKind ? (
        <section className="mt-10 space-y-4">
          {page.faqs.map((item, index) => (
            <details
              key={`${item.question}-${index}`}
              className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-slate-900">
                <span>{item.question}</span>
                <span className="text-xl leading-none text-slate-400 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="prose prose-slate mt-4 max-w-3xl text-sm leading-7">
                <PrismicRichText field={item.answer} />
              </div>
            </details>
          ))}
        </section>
      ) : null}
    </main>
  );
}
