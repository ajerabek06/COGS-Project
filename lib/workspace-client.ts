import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

export function getWorkspaceClient() {
  return generateClient<Schema>({
    authMode: "userPool",
  });
}
