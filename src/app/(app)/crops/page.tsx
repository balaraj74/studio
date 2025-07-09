
import { getCrops } from "@/lib/actions/crops";
import CropsPageClient from "./CropsPageClient";

export default async function CropsPage() {
    const crops = await getCrops();
    return <CropsPageClient crops={crops} />;
}
