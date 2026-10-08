import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'PulseFlow Project Management API',
    version: '1.0.0',
    description:
      'Production-grade REST API for PulseFlow - Cross-platform Project Management System (Web + Mobile). Supports JWT Authentication, Project & Task Lifecycle Management, Search/Filtering, and Metrics Dashboard.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token as: Bearer <your_token>',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email address' },
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          fullName: { type: 'string', example: 'Alex Morgan' },
          email: { type: 'string', format: 'email', example: 'alex@example.com' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Mobile App Redesign' },
          description: { type: 'string', example: 'Revamp UI/UX and enhance security' },
          status: { type: 'string', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], example: 'IN_PROGRESS' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          totalTasks: { type: 'integer', example: 5 },
          completedTasks: { type: 'integer', example: 3 },
          progressPercent: { type: 'integer', example: 60 },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Implement Keystore token storage' },
          description: { type: 'string', example: 'Store JWT safely on Android & iOS' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'HIGH' },
          status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], example: 'IN_PROGRESS' },
          dueDate: { type: 'string', format: 'date' },
          createdAt: { type: 'string', format: 'date-time' },
          projectId: { type: 'string', format: 'uuid' },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password'],
                properties: {
                  fullName: { type: 'string', example: 'Alex Morgan' },
                  email: { type: 'string', format: 'email', example: 'alex@example.com' },
                  password: { type: 'string', minLength: 6, example: 'securePassword123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful' },
          400: { description: 'Validation failed' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in with existing credentials',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'alex@example.com' },
                  password: { type: 'string', example: 'securePassword123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Log out current session',
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get authenticated user details',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current user profile returned' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/projects': {
      get: {
        tags: ['Projects'],
        summary: 'Get all user projects (supports search & status filtering)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search projects by name' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] } },
        ],
        responses: {
          200: { description: 'List of projects returned' },
        },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create a new project',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Enterprise Cloud Migration' },
                  description: { type: 'string', example: 'Modernize infrastructure' },
                  status: { type: 'string', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] },
                  startDate: { type: 'string', format: 'date' },
                  endDate: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Project created' },
        },
      },
    },
    '/api/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project details with associated tasks',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Project details' },
          404: { description: 'Project not found' },
        },
      },
      put: {
        tags: ['Projects'],
        summary: 'Update project details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Project updated' },
        },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Delete project and cascade associated tasks',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Project deleted' },
        },
      },
    },
    '/api/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Get all user tasks (supports search, project, status & priority filter)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] } },
        ],
        responses: {
          200: { description: 'List of tasks returned' },
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a new task under a project',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'projectId'],
                properties: {
                  name: { type: 'string', example: 'Setup CI/CD pipeline' },
                  description: { type: 'string', example: 'Configure GitHub Actions' },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
                  status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'PENDING' },
                  dueDate: { type: 'string', format: 'date' },
                  projectId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Task created' },
        },
      },
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get task by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Task details' },
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Update task (mark completed, change status or priority)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Task updated' },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete task',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Task deleted' },
        },
      },
    },
    '/api/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get user dashboard statistics (Total Projects, Total Tasks, Completed, Pending, In Progress)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Dashboard statistics' },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express): void => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });
};

