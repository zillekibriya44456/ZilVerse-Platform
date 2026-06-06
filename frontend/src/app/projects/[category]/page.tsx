import DynamicCategoryPage from "@/components/DynamicCategoryPage";

export default async function ProjectsCategory({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  return <DynamicCategoryPage title={`${resolvedParams.category} Projects`} category={resolvedParams.category} endpoint="/api/projects" />;
}
