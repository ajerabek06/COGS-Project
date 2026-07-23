"use client";

import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { createContext, useContext } from "react";
import outputs from "../amplify_outputs.json";

const hasCloudBackend = "auth" in outputs && "data" in outputs;
type SocialProvider = "google" | "facebook" | "amazon" | "apple";
const providerNames =
  (outputs as { auth?: { oauth?: { identity_providers?: string[] } } }).auth
    ?.oauth?.identity_providers ?? [];
const configuredSocialProviders = providerNames
  .map((provider): SocialProvider | null => {
    const normalized = provider.toLowerCase();
    if (normalized.includes("google")) return "google";
    if (normalized.includes("facebook")) return "facebook";
    if (normalized.includes("amazon")) return "amazon";
    if (normalized.includes("apple")) return "apple";
    return null;
  })
  .filter((provider): provider is SocialProvider => provider !== null);

if (hasCloudBackend) {
  Amplify.configure(outputs);
}

type AccountContextValue = {
  cloudEnabled: boolean;
  username: string | null;
  signOut?: () => void;
};

const AccountContext = createContext<AccountContextValue>({
  cloudEnabled: false,
  username: null,
});

export function useAccount() {
  return useContext(AccountContext);
}

export default function AmplifyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasCloudBackend) {
    return (
      <AccountContext.Provider
        value={{ cloudEnabled: false, username: "Local preview" }}
      >
        {children}
      </AccountContext.Provider>
    );
  }

  return (
    <Authenticator
      loginMechanisms={["email"]}
      socialProviders={configuredSocialProviders}
      signUpAttributes={["email"]}
    >
      {({ signOut, user }) => (
        <AccountContext.Provider
          value={{
            cloudEnabled: true,
            username: user?.signInDetails?.loginId ?? user?.username ?? null,
            signOut,
          }}
        >
          {children}
        </AccountContext.Provider>
      )}
    </Authenticator>
  );
}
