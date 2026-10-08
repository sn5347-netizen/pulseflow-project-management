import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export async function ensureDemoData(): Promise<void> {
  try {
    const email = 'demo@pulseflow.io';
    let demoUser = await prisma.user.findUnique({ where: { email } });

    if (!demoUser) {
      console.log('🌱 [Startup] Demo user missing. Seeding demo account and sample data...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);

      demoUser = await prisma.user.create({
        data: {
          fullName: 'Alex Vance',
          email,
          passwordHash,
        },
      });
      console.log(`👤 [Startup] Created demo user: ${demoUser.email}`);
    } else {
      // Ensure password hash always matches 'password123'
      const isMatch = await bcrypt.compare('password123', demoUser.passwordHash);
      if (!isMatch) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);
        await prisma.user.update({
          where: { id: demoUser.id },
          data: { passwordHash },
        });
        console.log(`🔑 [Startup] Restored demo user password to 'password123'`);
      }
    }

    // Check if projects exist for demoUser
    const projectCount = await prisma.project.count({
      where: { userId: demoUser.id },
    });

    if (projectCount === 0) {
      console.log('📁 [Startup] Seeding sample projects and tasks for demo user...');
      // Project 1: Mobile App Launch
      const project1 = await prisma.project.create({
        data: {
          name: 'Mobile App Launch v1.0',
          description: 'End-to-end development of cross-platform iOS and Android application with secure keystore authentication.',
          status: 'IN_PROGRESS',
          startDate: new Date('2026-10-01'),
          endDate: new Date('2026-11-15'),
          userId: demoUser.id,
        },
      });

      // Project 2: Cloud Infrastructure & CI/CD
      const project2 = await prisma.project.create({
        data: {
          name: 'Cloud Infrastructure & CI/CD',
          description: 'Automate Docker builds, container registries, and automated deployments with branch protection.',
          status: 'NOT_STARTED',
          startDate: new Date('2026-11-01'),
          endDate: new Date('2026-12-01'),
          userId: demoUser.id,
        },
      });

      // Project 3: Design System & Brand Identity
      const project3 = await prisma.project.create({
        data: {
          name: 'Design System & Component Library',
          description: 'Unified UI kit with accessible components, dark mode tokens, and fluid responsive layouts.',
          status: 'COMPLETED',
          startDate: new Date('2026-09-01'),
          endDate: new Date('2026-09-30'),
          userId: demoUser.id,
        },
      });

      // Tasks for Project 1
      await prisma.task.createMany({
        data: [
          {
            name: 'Configure Android Keystore and SecureStore',
            description: 'Ensure JWT tokens are stored securely in hardware-backed storage rather than plain local storage.',
            priority: 'HIGH',
            status: 'COMPLETED',
            dueDate: new Date('2026-10-10'),
            projectId: project1.id,
            userId: demoUser.id,
          },
          {
            name: 'Implement Pull-to-Refresh on Task lists',
            description: 'Add refresh controls and haptic feedback on mobile screens.',
            priority: 'MEDIUM',
            status: 'IN_PROGRESS',
            dueDate: new Date('2026-10-14'),
            projectId: project1.id,
            userId: demoUser.id,
          },
          {
            name: 'Add Offline Banner and Network Error Toasts',
            description: 'Gracefully catch connection loss and notify the user without throwing runtime unhandled exceptions.',
            priority: 'HIGH',
            status: 'PENDING',
            dueDate: new Date('2026-10-18'),
            projectId: project1.id,
            userId: demoUser.id,
          },
          {
            name: 'Prepare APK build with EAS',
            description: 'Produce standalone Android APK build for reviewer testing.',
            priority: 'LOW',
            status: 'PENDING',
            dueDate: new Date('2026-10-25'),
            projectId: project1.id,
            userId: demoUser.id,
          },
        ],
      });

      // Tasks for Project 2
      await prisma.task.createMany({
        data: [
          {
            name: 'Write Multi-stage Dockerfile for Backend',
            description: 'Optimize image size using node:alpine and slim runtime.',
            priority: 'MEDIUM',
            status: 'PENDING',
            dueDate: new Date('2026-11-05'),
            projectId: project2.id,
            userId: demoUser.id,
          },
          {
            name: 'Setup GitHub Actions CI Pipeline',
            description: 'Run linter, TypeScript check, and automated tests on PR.',
            priority: 'HIGH',
            status: 'PENDING',
            dueDate: new Date('2026-11-12'),
            projectId: project2.id,
            userId: demoUser.id,
          },
        ],
      });

      // Tasks for Project 3
      await prisma.task.createMany({
        data: [
          {
            name: 'Publish Color Tokens and Typography scales',
            description: 'Finalize Tailwind theme presets and CSS variables.',
            priority: 'MEDIUM',
            status: 'COMPLETED',
            dueDate: new Date('2026-09-15'),
            projectId: project3.id,
            userId: demoUser.id,
          },
          {
            name: 'Accessible Dialog & Modal primitives',
            description: 'Ensure focus trapping, ESC dismiss, and ARIA attributes.',
            priority: 'HIGH',
            status: 'COMPLETED',
            dueDate: new Date('2026-09-28'),
            projectId: project3.id,
            userId: demoUser.id,
          },
        ],
      });
      console.log('✅ [Startup] Sample projects and tasks successfully seeded.');
    } else {
      console.log(`✅ [Startup] Demo account verified (${projectCount} existing projects).`);
    }
  } catch (error) {
    console.error('⚠️ [Startup] Error ensuring demo data:', error);
  }
}

