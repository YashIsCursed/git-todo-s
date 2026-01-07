import { createClient } from "@/lib/supabase/server";
import { getRepoById, getRepoTree } from "@/lib/gitdata/functions";
import RepoManager from "@/components/dashboard/repo-manager";
import { redirect } from "next/navigation";

export default async function RepoDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect("/sign-in");
  }

  const token = session.provider_token;
  if (!token) {
    return (
      <div className="p-8 text-center text-red-500">
        GitHub access token not found. Please sign out and sign in again.
      </div>
    );
  }

  // Fetch Repo Details
  let repo;
  try {
    repo = await getRepoById(token, id);
  } catch (error) {
    console.error(error);
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Repository Not Found</h2>
        <p className="text-muted-foreground">
          Could not load repository with ID: {id}
        </p>
      </div>
    );
  }

  // Fetch File Tree
  // We need the default branch to get the tree
  // repo.default_branch
  let treeRequestData;
  try {
    treeRequestData = await getRepoTree(
      token,
      repo.full_name,
      repo.default_branch
    );
  } catch (error) {
    console.error(error);
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Could not load file tree</h2>
        <p className="text-muted-foreground">Is the repository empty?</p>
      </div>
    );
  }

  const tree = treeRequestData.tree; // The API returns object { sha, url, tree: [...] }

  return <RepoManager repo={repo} tree={tree} />;
}
