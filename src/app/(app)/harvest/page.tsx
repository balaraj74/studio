
import { initialHarvests } from "@/lib/data";
import HarvestPageClient from "./HarvestPageClient";

export default function HarvestPage() {
    return <HarvestPageClient initialHarvests={initialHarvests} />;
}
