
import { schemes, states, crops } from "@/lib/data";
import SchemesPageClient from "./SchemesPageClient";

export default function SchemesPage() {
  return <SchemesPageClient schemes={schemes} states={states} crops={crops} />;
}
