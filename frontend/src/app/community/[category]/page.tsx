import DynamicCategoryPage from "@/components/DynamicCategoryPage";

export default async function CommunityCategory({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  return <DynamicCategoryPage title={`${resolvedParams.category}`} category={resolvedParams.category} endpoint="/api/projects" />; // Mocking with projects for now
}
