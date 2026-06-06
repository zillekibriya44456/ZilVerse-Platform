import DynamicCategoryPage from "@/components/DynamicCategoryPage";

export default async function FreelancersCategory({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  return <DynamicCategoryPage title={`${resolvedParams.category}`} category={resolvedParams.category} endpoint="/api/freelancers" />;
}
