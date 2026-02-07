export async function getUserRepos(AuthorizationTOKEN: string) {
  const response = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `Bearer ${AuthorizationTOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch repositories");
  }

  const data = await response.json();
  return data;
}
