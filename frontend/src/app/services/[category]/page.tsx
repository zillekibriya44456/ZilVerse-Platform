import DynamicCategoryPage from "@/components/DynamicCategoryPage";

export default async function ServicesCategory({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  return <DynamicCategoryPage title={`${resolvedParams.category} Services`} category={resolvedParams.category} endpoint="/api/services" />;
}
