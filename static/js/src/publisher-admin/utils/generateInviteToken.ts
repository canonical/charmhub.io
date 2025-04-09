export async function generateInviteToken(
  email: string,
  packageName: string,
  csrfToken: string
): Promise<string> {
  const formData = new FormData();
  formData.set("collaborators", email);
  formData.set("csrf_token", csrfToken);

  const response = await fetch(`/api/packages/${packageName}/invites`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to generate invite link");
  }

  const inviteData = await response.json();

  if (!inviteData.success) {
    throw new Error(inviteData.message);
  }

  const token = inviteData.data[0].token;

  return `https://charmhub.io/accept-invite?package=${packageName}&token=${token}`;
}
