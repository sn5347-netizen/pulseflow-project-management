import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Concurrently fetch counts for maximum performance
    const [
      totalProjects,
      projectsInProgress,
      projectsCompleted,
      projectsNotStarted,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      recentProjects,
      upcomingTasks,
    ] = await Promise.all([
      // Total Projects owned by user
      prisma.project.count({ where: { userId } }),

      // Projects In Progress
      prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),

      // Projects Completed
      prisma.project.count({ where: { userId, status: 'COMPLETED' } }),

      // Projects Not Started
      prisma.project.count({ where: { userId, status: 'NOT_STARTED' } }),

      // Total Tasks
      prisma.task.count({ where: { userId } }),

      // Completed Tasks
      prisma.task.count({ where: { userId, status: 'COMPLETED' } }),

      // Pending Tasks
      prisma.task.count({ where: { userId, status: 'PENDING' } }),

      // In Progress Tasks
      prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),

      // Recent 5 projects with task count
      prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          tasks: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      }),

      // Upcoming/urgent pending tasks
      prisma.task.findMany({
        where: {
          userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
        ],
        take: 5,
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const projectCompletionRate = totalProjects > 0 ? Math.round((projectsCompleted / totalProjects) * 100) : 0;

    const formattedRecentProjects = recentProjects.map((p) => {
      const pTotal = p.tasks.length;
      const pDone = p.tasks.filter((t) => t.status === 'COMPLETED').length;
      return {
        id: p.id,
        name: p.name,
        status: p.status,
        totalTasks: pTotal,
        completedTasks: pDone,
        progressPercent: pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0,
        createdAt: p.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        projectsInProgress,
        projectsCompleted,
        projectsNotStarted,
        taskCompletionRate,
        projectCompletionRate,
        recentProjects: formattedRecentProjects,
        upcomingTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

