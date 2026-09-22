import { notFound } from "next/navigation";

/** Routes unknown localized paths to the localized not-found page. */
export default function CatchAllPage() {
  notFound();
}
