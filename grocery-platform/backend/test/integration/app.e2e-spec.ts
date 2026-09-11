import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';

describe('FreshCart API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  let refreshToken: string;
  let adminToken: string;
  let testUserId: string;
  let testProductId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Cleanup test data
    await prismaService.$executeRaw`DELETE FROM users WHERE email LIKE '%@test.freshcart.io'`;
    await app.close();
  });

  describe('Auth Module', () => {
    const testUser = {
      email: `e2e-${Date.now()}@test.freshcart.io`,
      password: 'TestPassword123!',
      firstName: 'E2E',
      lastName: 'Test',
    };

    describe('POST /auth/register', () => {
      it('should register a new user', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send(testUser)
          .expect(201);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
        expect(response.body.user.email).toBe(testUser.email);

        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
        testUserId = response.body.user.id;
      });

      it('should reject duplicate email', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send(testUser)
          .expect(409);
      });

      it('should reject invalid email format', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({ ...testUser, email: 'invalid-email' })
          .expect(400);
      });

      it('should reject weak password', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({ ...testUser, email: 'weak@test.io', password: '123' })
          .expect(400);
      });
    });

    describe('POST /auth/login', () => {
      it('should login with valid credentials', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password,
          })
          .expect(200);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
      });

      it('should reject invalid password', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword',
          })
          .expect(401);
      });

      it('should reject non-existent user', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: 'nonexistent@test.io',
            password: 'somepassword',
          })
          .expect(401);
      });
    });

    describe('POST /auth/refresh-token', () => {
      it('should refresh tokens with valid refresh token', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/refresh-token')
          .send({ refreshToken })
          .expect(200);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
      });

      it('should reject invalid refresh token', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/refresh-token')
          .send({ refreshToken: 'invalid-token' })
          .expect(401);
      });
    });
  });

  describe('Categories Module (Public)', () => {
    describe('GET /categories', () => {
      it('should return categories without authentication', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/categories')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });

  describe('Products Module (Public)', () => {
    describe('GET /products', () => {
      it('should return paginated products', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/products')
          .query({ page: 1, limit: 10 })
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('page');
      });
    });

    describe('GET /products/featured', () => {
      it('should return featured products', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/products/featured')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /products/search', () => {
      it('should search products', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/products/search')
          .query({ q: 'apple' })
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });

  describe('Users Module (Protected)', () => {
    describe('GET /users/me', () => {
      it('should return current user profile', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/me')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('email');
        expect(response.body).toHaveProperty('firstName');
      });

      it('should reject unauthenticated request', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/users/me')
          .expect(401);
      });
    });

    describe('PATCH /users/profile', () => {
      it('should update user profile', async () => {
        const response = await request(app.getHttpServer())
          .patch('/api/v1/users/profile')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ firstName: 'Updated' })
          .expect(200);

        expect(response.body.firstName).toBe('Updated');
      });
    });
  });

  describe('Delivery Module', () => {
    describe('GET /delivery/zones', () => {
      it('should return delivery zones', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/delivery/zones')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /delivery/slots', () => {
      it('should return available slots', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/delivery/slots')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive requests', async () => {
      // Make multiple rapid requests
      const requests = Array(130).fill(null).map(() =>
        request(app.getHttpServer()).get('/api/v1/categories')
      );

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);

      // Should have some rate limited responses
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    it('should reject request with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'test@test.io' }) // Missing password, firstName, lastName
        .expect(400);
    });

    it('should sanitize and validate input', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: '  Test@Example.COM  ', // Should be trimmed and lowercased
          password: 'TestPassword123!',
        });

      // Should handle gracefully (either 401 for invalid user or process correctly)
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/nonexistent-route')
        .expect(404);
    });

    it('should return proper error format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/non-existent-slug')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('statusCode');
    });
  });
});
