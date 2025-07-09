
import { initialCrops } from "@/lib/data";
import CropsPageClient from "./CropsPageClient";

export default function CropsPage() {
    return <CropsPageClient initialCrops={initialCrops} />;
}
