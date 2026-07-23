import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Workspace: a
    .model({
      name: a.string().required(),
      payload: a.json().required(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
