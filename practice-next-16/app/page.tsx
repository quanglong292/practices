"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-md pt-2">
          <a
            href="/web-payment"
            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                💳
              </div>
              <div className="text-left">
                <div className="font-bold text-sm">Web Payment API POC</div>
                <div className="text-xs text-blue-100 font-normal">W3C Payment Request, Google Pay, Apple Pay</div>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 font-semibold">Demo &rarr;</span>
          </a>

          <a
            href="/ts-table"
            className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xl">
                📊
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">TanStack Virtual Table POC</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">Virtual scrolling & data table demo</div>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">&rarr;</span>
          </a>
        </div>
      </main>
    </div>
  );
}
