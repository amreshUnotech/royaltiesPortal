// apolloClient.js
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from '@apollo/client';
import { decode } from 'js-base64';
import { NEXT_PUBLIC_GRAPHQL_URI } from '../../../env';

const createApolloClient = (accessToken?: string) => {
  const httpLink = new HttpLink({
    uri: NEXT_PUBLIC_GRAPHQL_URI,
  });

  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: accessToken ? `Bearer ${decode(accessToken)}` : '',
      },
    }));
    return forward(operation);
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};

export default createApolloClient;
