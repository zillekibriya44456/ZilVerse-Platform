import DynamicCategoryPage from "@/components/DynamicCategoryPage";

export default async function JobsCategory({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  return <DynamicCategoryPage title={`${resolvedParams.category} Jobs`} category={resolvedParams.category} endpoint="/api/jobs" />;
}
