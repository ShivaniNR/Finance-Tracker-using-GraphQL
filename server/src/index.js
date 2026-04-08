const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { GraphQLError } = require('graphql');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { supabaseAdmin, createUserClient } = require('../services/supabase');

async function startServer() {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: [
        'http://localhost:5173', // Vite dev server
        'http://localhost:4173', // Vite preview
      ],
      credentials: true,
    })
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window per IP
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (formattedError, error) => {
      // Log errors server-side but don't expose internal details to client
      console.error('GraphQL Error:', error);

      // Pass through validation and auth errors as-is
      if (
        formattedError.extensions?.code === 'UNAUTHENTICATED' ||
        formattedError.extensions?.code === 'BAD_USER_INPUT'
      ) {
        return formattedError;
      }

      // For unexpected errors, return a generic message in production
      if (process.env.NODE_ENV === 'production') {
        return {
          message: 'An unexpected error occurred',
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        };
      }

      return formattedError;
    },
  });

  await server.start();

  // GraphQL endpoint with authentication
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }

        // Verify the JWT with Supabase
        const {
          data: { user },
          error,
        } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
          throw new GraphQLError('Invalid or expired token', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }

        // Create a user-scoped Supabase client that respects RLS
        const supabase = createUserClient(token);

        return {
          userId: user.id,
          supabase,
          token,
        };
      },
    })
  );

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
    console.log(`Health check at http://localhost:${PORT}/health`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
