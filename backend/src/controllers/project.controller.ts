import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';

export const getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { search, status } = req.query as { search?: string; status?: string };

    const whereClause: any = {
      userId,
    };

    if (search && search.trim() !== '') {
      whereClause.name = {
        contains: search.trim(),
      };
    }

    if (status && status.trim() !== '') {
      whereClause.status = status.trim();
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Compute task stats per project
    const formattedProjects = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter((t) => t.status === 'COMPLETED').length;
      const inProgressTasks = p.tasks.filter((t) => t.status === 'IN_PROGRESS').length;
      const pendingTasks = p.tasks.filter((t) => t.status === 'PENDING').length;
      const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        progressPercent,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedProjects,
      count: formattedProjects.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        tasks: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to access it.',
      });
      return;
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
    const inProgressTasks = project.tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const pendingTasks = project.tasks.filter((t) => t.status === 'PENDING').length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        ...project,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        progressPercent,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, description, status, startDate, endDate } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || 'NOT_STARTED',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, description, status, startDate, endDate } = req.body;

    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existingProject) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to update it.',
      });
      return;
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existingProject) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to delete it.',
      });
      return;
    }

    await prisma.project.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

