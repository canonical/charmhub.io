import { generateInviteToken } from "../generateInviteToken";

describe("generateInviteToken", () => {
  const email = "test@example.com";
  const packageName = "test-package";
  const csrfToken = "test-csrf-token";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("returns token and invite link on success", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ token: "test-token" }],
      }),
    }) as jest.Mock;

    const result = await generateInviteToken(email, packageName, csrfToken);

    expect(result).toEqual({
      token: "test-token",
      inviteLink: `https://charmhub.io/accept-invite?package=${packageName}&token=test-token`,
    });

    expect(fetch).toHaveBeenCalledWith(
      `/api/packages/${packageName}/invites`,
      expect.anything()
    );
  });

  test("throws an error if response is not ok", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error",
    }) as jest.Mock;

    await expect(
      generateInviteToken(email, packageName, csrfToken)
    ).rejects.toThrow("Failed to generate invite link");
  });

  test("throws an error if success is false in JSON", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        message: "Something went wrong",
      }),
    }) as jest.Mock;

    await expect(
      generateInviteToken(email, packageName, csrfToken)
    ).rejects.toThrow("Something went wrong");
  });
});
