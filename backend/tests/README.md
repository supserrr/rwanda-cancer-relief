# Testing Guide

Testing guide for Rwanda Cancer Relief backend.

## Test Structure

```
tests/
├── unit/           # Unit tests for services, utilities
├── integration/    # Integration tests for API endpoints
├── e2e/           # End-to-end tests for complete flows
└── setup.ts       # Test configuration and setup
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Unit Tests Only

```bash
npm run test:unit
```

### Run Integration Tests Only

```bash
npm run test:integration
```

### Run E2E Tests Only

```bash
npm run test:e2e
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

## Test Types

### Unit Tests

Test individual functions and services in isolation:

- Service layer functions
- Utility functions
- Validation schemas
- Error handling

### Integration Tests

Test API endpoints with database interactions:

- Authentication flows
- CRUD operations
- Database queries
- Error responses

### E2E Tests

Test complete user flows:

- Complete authentication flow
- Session booking flow
- Chat messaging flow
- Resource management flow

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as service from '../../src/services/auth.service';

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', async () => {
    // Test implementation
    expect(true).toBe(true);
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Authentication API', () => {
  it('should sign up a new user', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!',
        role: 'patient',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
  });
});
```

## Test Database

Tests should use a separate test database:

1. Create a test Supabase project
2. Run migrations on test database
3. Use test credentials in `.env.test`

## Mocking

### Mock Supabase Client

```typescript
vi.mock('../../src/config/supabase', () => ({
  getSupabaseClient: vi.fn(() => mockSupabaseClient),
  getSupabaseServiceClient: vi.fn(() => mockSupabaseClient),
}));
```

### Mock External Services

```typescript
vi.mock('../../src/services/jitsi.service', () => ({
  createJitsiRoom: vi.fn(() => Promise.resolve({
    roomName: 'test-room',
    roomUrl: 'https://8x8.vc/test-room',
  })),
}));
```

## Test Data

Use test fixtures for consistent test data:

```typescript
// tests/fixtures/users.ts
export const testUsers = {
  patient: {
    email: 'patient@test.com',
    password: 'TestPassword123!',
    role: 'patient',
  },
  counselor: {
    email: 'counselor@test.com',
    password: 'TestPassword123!',
    role: 'counselor',
  },
};
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Clean Up**: Clean up test data after each test
3. **Use Fixtures**: Use consistent test data
4. **Mock External Services**: Don't call real external services
5. **Test Edge Cases**: Test error conditions and edge cases
6. **Descriptive Names**: Use clear test descriptions
7. **Arrange-Act-Assert**: Follow AAA pattern

## Continuous Integration

Tests run automatically in CI:

1. Install dependencies
2. Run migrations on test database
3. Run all tests
4. Generate coverage report
5. Upload coverage to service

## Troubleshooting

### Tests Failing

1. Check test database connection
2. Verify migrations are applied
3. Check environment variables
4. Review test logs

### Coverage Issues

1. Ensure all paths are covered
2. Add tests for edge cases
3. Review uncovered code

## Next Steps

1. Write more unit tests
2. Add integration tests for all endpoints
3. Create E2E test scenarios
4. Set up CI/CD pipeline

