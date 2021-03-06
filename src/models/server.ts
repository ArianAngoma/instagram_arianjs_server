import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {ExpressContext} from 'apollo-server-express/dist/ApolloServer';
import {graphqlUploadExpress} from 'graphql-upload';

import {typeDefs, resolvers} from '../graphql/schema';
import {dbConnection} from '../database/config';

export class Server {
  private readonly apolloServer: ApolloServer;
  private readonly port: string;

  constructor() {
    this.connectDB();
    this.apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      context: async ({req}: ExpressContext) => ({req}),
    });
    this.port = process.env.PORT || '4000';
  }

  async connectDB(): Promise<void> {
    await dbConnection();
  }

  async listen(): Promise<void> {
    await this.apolloServer.start();

    const app = express();
    app.use(graphqlUploadExpress());
    this.apolloServer.applyMiddleware({app});

    await new Promise<void>((r) => app.listen({port: this.port}, r));
    console.log(`Server ready`);
  }
}
