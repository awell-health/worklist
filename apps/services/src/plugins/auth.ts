import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { createRemoteJWKSet, jwtVerify } from "jose";
import assert from "node:assert";
import type { IncomingHttpHeaders } from "node:http";

const extractBearerTokenFromHeaders = ({
  authorization,
}: IncomingHttpHeaders) => {
  if (!authorization) {
    throw new Error("Authorization header is missing");
  }

  if (!authorization.startsWith("Bearer")) {
    throw new Error("Authorization header is not in the Bearer scheme");
  }

  return authorization.slice(7); // The length of 'Bearer ' is 7
};

const authPlugin: FastifyPluginAsync = async (fastify, options) => {
  // Generate a JWKS using jwks_uri obtained from the Logto server
  const jwks = createRemoteJWKSet(
    new URL(`${fastify.configuration.LOGTO_ENDPOINT}/oidc/jwks`)
  );
  fastify.addHook("preHandler", async (request, reply) => {
    // Extract the token using the helper function defined above
    const token = extractBearerTokenFromHeaders(request.headers);

    const { payload } = await jwtVerify(
      // The raw Bearer Token extracted from the request header
      token,
      jwks,
      {
        // Expected issuer of the token, issued by the Logto server
        issuer: "http://localhost:3001/oidc",
        // Expected audience token, the resource indicator of the current API
        audience: "http://localhost:3037",
      }
    );

    // Sub is the user ID, used for user identification
    const { scope, } = payload as { scope: string; };

    // For role-based access control, we'll discuss it later
    assert(scope.split(" ").includes("read:products"));
  });
};

export default fp(authPlugin, {
  name: "auth",
  dependencies: ["configuration"],
});

declare module "fastify" {
  interface FastifyRequest {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    user: any;
    tenantId: string | null;
  }
}
