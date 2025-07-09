
import { getHarvests } from "@/lib/actions/harvests";
import HarvestPageClient from "./HarvestPageClient";

export default async function HarvestPage() {
    const harvests = await getHarvests();
    return <HarvestPageClient harvests={harvests} />;
}
