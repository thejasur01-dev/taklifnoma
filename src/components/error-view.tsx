import type { ReactNode } from "react";

type Props = { code: string; title: string; text: string; children?: ReactNode };

export function ErrorView({ code, title, text, children }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="font-heading text-6xl text-muted-foreground" aria-hidden="true">
        {code}
      </p>
      <h1 className="font-heading text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{text}</p>
      {children}
    </main>
  );
}
