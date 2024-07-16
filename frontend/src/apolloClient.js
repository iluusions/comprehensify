import { ApolloClient, InMemoryCache, HttpLink, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({ uri: process.env.REACT_APP_GRAPHQL_URI }), // Replace with your GraphQL server URL
  cache: new InMemoryCache(),
});

export default client;
