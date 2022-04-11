import jwt from 'jsonwebtoken';

// By default, API Gateway authorizations are cached (TTL) for 300 seconds.
// This policy will authorize all requests to the same API Gateway instance where the
// request is coming from, thus being efficient and optimising costs.
const generatePolicy = (principalId, methodArn) => {
  const apiGatewayWildcard = methodArn.split('/', 2).join('/') + '/*';

  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: apiGatewayWildcard,
        },
      ],
    },
  };
};

export async function handler(event, context) {
  console.log(event.authorizationToken)
  if (!event.authorizationToken) {
    throw 'Unauthorized';
  }

  const token = event.authorizationToken.replace('Bearer ', '');

  try {
    const claims = jwt.verify(token, process.env.AUTH0_PUBLIC_KEY);
    const policy = generatePolicy(claims.data.sub, event.methodArn);
    console.log(claims,claims.sub, policy, event.methodArn, "-----------------> claim")

    return {
      ...policy,
      context: claims.data
    };
  } catch (error) {
    console.log(error);
    throw 'Unauthorized';
  }
};
