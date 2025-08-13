# @ziron/api - oRPC API Package

This package provides a type-safe API layer using oRPC (Object Remote Procedure Call) for your FoneFlip project. It includes both client and server implementations with full TypeScript support.

## Features

- ✅ **Type-safe API calls** - Full TypeScript support with Zod validation
- ✅ **Client-side utilities** - Easy-to-use API client for React components
- ✅ **Server-side procedures** - Structured API procedures with validation
- ✅ **Next.js integration** - Ready-to-use API routes
- ✅ **Future-proof architecture** - Built for scalability and maintainability

## Structure

```
packages/api/
├── src/
│   ├── types.ts          # Zod schemas and TypeScript types
│   ├── server.ts         # Server-side procedures
│   ├── client.ts         # Client-side API utilities
│   └── index.ts          # Main exports
└── README.md
```

## Usage

### 1. Server-Side Procedures

Define your API procedures in `server.ts`:

```typescript
import type { User, CreateUser, UpdateUser } from './types';

export const userProcedures = {
  create: async (input: CreateUser): Promise<User> => {
    // Your business logic here
    return user;
  },
  
  get: async (input: { id: string }): Promise<User | null> => {
    // Fetch user logic
    return user;
  },
  
  // ... more procedures
};
```

### 2. Client-Side Usage

Use the API client in your React components:

```typescript
import { userApi, healthApi } from '@ziron/api';

// Create a user
const newUser = await userApi.create({
  email: 'user@example.com',
  name: 'John Doe'
});

// Get a user
const user = await userApi.get('user-id');

// List users with pagination
const result = await userApi.list({ limit: 10, offset: 0 });

// Health check
const health = await healthApi.check();
```

### 3. Next.js API Routes

The package includes a ready-to-use API route at `/api/orpc`:

```typescript
// POST /api/orpc
{
  "procedure": "user.create",
  "input": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## API Reference

### Types

- `User` - User entity type
- `CreateUser` - Input type for creating users
- `UpdateUser` - Input type for updating users
- `ApiResponse` - Standard API response wrapper

### Client API

- `userApi.create(data)` - Create a new user
- `userApi.get(id)` - Get a user by ID
- `userApi.list(params)` - List users with pagination
- `userApi.update(id, data)` - Update a user
- `userApi.delete(id)` - Delete a user
- `healthApi.check()` - Health check endpoint

### Server Procedures

- `userProcedures.create(input)` - Create user procedure
- `userProcedures.get(input)` - Get user procedure
- `userProcedures.list(input)` - List users procedure
- `userProcedures.update(input)` - Update user procedure
- `userProcedures.delete(input)` - Delete user procedure
- `healthProcedures.check()` - Health check procedure

## Adding New Procedures

1. **Define the schema** in `types.ts`:
```typescript
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  // ... more fields
});
```

2. **Add the procedure** in `server.ts`:
```typescript
export const productProcedures = {
  create: async (input: CreateProduct): Promise<Product> => {
    // Implementation
  },
  // ... more procedures
};
```

3. **Export from index.ts**:
```typescript
export * from './types';
export * from './server';
export * from './client';
```

4. **Add to client** in `client.ts`:
```typescript
export const productApi = {
  create: apiClient.createProduct.bind(apiClient),
  // ... more methods
};
```

## Future Enhancements

This setup is designed to be easily extended with:

- **Database integration** - Replace mock data with real database calls
- **Authentication** - Add auth middleware to procedures
- **Caching** - Implement Redis caching for frequently accessed data
- **Real-time updates** - Add WebSocket support for live data
- **Advanced validation** - Extend Zod schemas with custom validators
- **Error handling** - Implement structured error responses
- **Rate limiting** - Add rate limiting middleware
- **Monitoring** - Add logging and metrics

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Type check
pnpm typecheck

# Format code
pnpm format
```

## Integration with Other Apps

To use this API package in other apps in your monorepo:

1. Add to `package.json`:
```json
{
  "dependencies": {
    "@ziron/api": "workspace:*"
  }
}
```

2. Import and use:
```typescript
import { userApi } from '@ziron/api';
```

This setup provides a solid foundation for building scalable, type-safe APIs in your FoneFlip project! 