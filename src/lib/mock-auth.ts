export class AuthError extends Error {}

/**
 * Placeholder for the real Google OAuth call. Simulates network latency and,
 * for local testing of the error state, fails when `?simulate=fail` is set.
 */
export async function signInWithGoogle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const simulateFailure =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("simulate") === "fail";

  if (simulateFailure) {
    throw new AuthError(
      "Não foi possível completar a autenticação. Por favor, tente novamente."
    );
  }
}
