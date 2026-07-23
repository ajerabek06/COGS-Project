import { defineAuth, secret } from "@aws-amplify/backend";

const redirectUrl =
  process.env.AUTH_REDIRECT_URL ?? "http://localhost:3000/";
const socialAuthEnabled = process.env.ENABLE_SOCIAL_AUTH === "true";

export const auth = defineAuth({
  loginWith: {
    email: true,
    ...(socialAuthEnabled
      ? {
          externalProviders: {
            google: {
              clientId: secret("GOOGLE_CLIENT_ID"),
              clientSecret: secret("GOOGLE_CLIENT_SECRET"),
            },
            facebook: {
              clientId: secret("FACEBOOK_CLIENT_ID"),
              clientSecret: secret("FACEBOOK_CLIENT_SECRET"),
            },
            loginWithAmazon: {
              clientId: secret("LOGINWITHAMAZON_CLIENT_ID"),
              clientSecret: secret("LOGINWITHAMAZON_CLIENT_SECRET"),
            },
            callbackUrls: [redirectUrl],
            logoutUrls: [redirectUrl],
          },
        }
      : {}),
  },
});
