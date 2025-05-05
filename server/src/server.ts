context: authMiddleware as (context: { req: Request }) => Context

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import path from 'path';
import { typeDefs, resolvers } from './schemas';
import db from './config/connection';
import { authMiddleware } from './utils/auth';
import { Context } from './types/context';

const app = express();
const PORT = process.env.PORT || 3001;

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware as (context: any) => Context
  });

  await server.start();
  server.applyMiddleware({ app });

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
}

startApolloServer();
// This code sets up an Apollo Server with Express, connects to a MongoDB database, and serves a React application in production mode. It also includes authentication middleware for GraphQL requests.