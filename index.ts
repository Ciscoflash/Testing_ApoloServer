import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { graphql } from "graphql";
import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import http from "http";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
const app = express();
app.use(cors());
app.use(express.json());

interface myContext {
  token?: String;
}

const httpServer = http.createServer(app);

// Type Defs
const typeDefs = `#graphql

type Book {
  title: String
  author: String
}

type Query {
  books: [Book]
}
`;

// Define the data sets
const books = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
  },
];

// Create the Resolver object
const resolvers = {
  Query: {
    books: () => books,
  },
};

// Create an instance of the Appolo server

const server = new ApolloServer<myContext>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

//these is to start the server
await server.start();

app.use(
  "/",
  cors<cors.CorsRequest>(),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  })
);

await new Promise<void>((resolve) =>
  httpServer.listen({ port: 4000 }, resolve)
);
console.log(`🚀 Server ready at http://localhost:4000/`);
