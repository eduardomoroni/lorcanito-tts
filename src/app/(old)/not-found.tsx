import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Page not found",
  description: "Play Disney Lorcana Online.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col">
      <main className="mx-auto flex w-full max-w-7xl flex-auto flex-col justify-center px-6 py-24 sm:py-64 lg:px-8">
        <p className="text-base font-semibold leading-8 text-indigo-600">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <p className="mt-6 text-base leading-7 text-gray-600">
          If you need help, please reach out to us
          <a
            href="https://discord.com/invite/FY7XJq3WRc/"
            target="_blank"
            className="text-sm font-semibold leading-7 text-indigo-600"
          >
            on discord.
          </a>
        </p>
        <div className="mt-10">
          <Link
            href="/"
            className="text-sm font-semibold leading-7 text-indigo-600"
          >
            <span aria-hidden="true">&larr;</span> Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
