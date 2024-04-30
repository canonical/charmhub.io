import { useMutation } from "react-query";

function useRevokeMutation(
  packageName: string | undefined,
  activeInviteEmail: string | undefined,
  queryKey: string,
  setShowRevokeSuccess: Function,
  setShowRevokeError: Function,
  queryClient: any,
  csrfToken: string
) {
  return useMutation(
    async () => {
      if (!activeInviteEmail) {
        return;
      }

      const formData = new FormData();

      formData.set("csrf_token", csrfToken);
      formData.set("collaborator", activeInviteEmail);

      const response = await fetch(`/api/packages/${packageName}/invites`, {
        method: "DELETE",
        body: formData,
      });

      if (!response.ok) {
        setShowRevokeError(true);
        throw new Error(response.statusText);
      }

      const responseData = await response.json();

      if (!responseData.success) {
        setShowRevokeError(true);
        throw new Error(responseData.message);
      }

      setShowRevokeSuccess(true);
    },
    {
      onError: ({ context }) => {
        queryClient.setQueryData(queryKey, context?.previousInvites);
      },
      onSettled: () => {
        queryClient.invalidateQueries();
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      },
    }
  );
}

export default useRevokeMutation;
