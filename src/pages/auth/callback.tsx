/**
 * OAuth callback page -- handles the redirect from HuggingFace after the
 * user grants consent.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { HF_CLIENT_ID, HF_TOKEN_URL } from "@/lib/auth";
import { Suspense } from "react";

function CallbackContent() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const exchangeCode = async () => {
      const code =
        typeof router.query.code === "string" ? router.query.code : null;
      const state =
        typeof router.query.state === "string" ? router.query.state : null;
      const error =
        typeof router.query.error === "string" ? router.query.error : null;

      if (error) {
        setStatus("error");
        setErrorMessage(
          (typeof router.query.error_description === "string"
            ? router.query.error_description
            : null) || "Authorization was denied."
        );
        return;
      }

      if (!code) {
        setStatus("error");
        setErrorMessage("No authorization code received.");
        return;
      }

      const savedState = sessionStorage.getItem("hf_oauth_state");
      if (state !== savedState) {
        setStatus("error");
        setErrorMessage("State mismatch. Possible CSRF attack.");
        return;
      }

      const codeVerifier = sessionStorage.getItem("hf_code_verifier");
      if (!codeVerifier) {
        setStatus("error");
        setErrorMessage("Missing code verifier. Please try logging in again.");
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/auth/callback`;

        const tokenResponse = await fetch(HF_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: HF_CLIENT_ID,
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
          }),
        });

        if (!tokenResponse.ok) {
          const err = await tokenResponse.text();
          throw new Error(`Token exchange failed: ${err}`);
        }

        const tokenData = await tokenResponse.json();

        const cookieResponse = await fetch("/api/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: tokenData.access_token }),
        });

        if (!cookieResponse.ok) {
          throw new Error("Failed to store token");
        }

        sessionStorage.removeItem("hf_code_verifier");
        sessionStorage.removeItem("hf_oauth_state");

        window.location.assign("/");
      } catch (err: unknown) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Failed to complete authentication."
        );
      }
    };

    exchangeCode();
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        {status === "loading" ? (
          <>
            <div className="h-10 w-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-white/60">Authenticating...</p>
          </>
        ) : (
          <div className="bg-[#111] border border-red-500/20 rounded-2xl p-8 max-w-md">
            <p className="text-red-400 font-medium mb-2">
              Authentication Failed
            </p>
            <p className="text-sm text-white/40 mb-6">{errorMessage}</p>
            <button
              onClick={() => router.push("/login")}
              className="bg-white/10 hover:bg-white/20 text-white text-sm px-6 py-2.5 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="h-10 w-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
