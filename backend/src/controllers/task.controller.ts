import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';

export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { projectId, search, status, priority } = req.query as {
      projectId?: string;
      search?: string;
      status?: string;
      priority?: string;
    };

    const whereClause: any = {
      userId,
    };

    if (projectId && projectId.trim() !== '') {
      whereClause.projectId = projectId.trim();
    }

    if (search && search.trim() !== '') {
      whereClause.name = {
        contains: search.trim(),
      };
    }

    if (status && status.trim() !== '') {
      whereClause.status = status.trim();
    }

    if (priority && priority.trim() !== '') {
      whereClause.priority = priority.trim();
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to view it.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, description, priority, status, dueDate, projectId } = req.body;

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to add tasks to it.',
      });
      return;
    }

    const task = await prisma.task.create({
      data: {
        name,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, description, priority, status, dueDate, projectId } = req.body;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to modify it.',
      });
      return;
    }

    // If projectId is being changed, verify ownership of new project
    if (projectId && projectId !== existingTask.projectId) {
      const targetProject = await prisma.project.findFirst({
        where: { id: projectId, userId },
      });
      if (!targetProject) {
        res.status(404).json({
          success: false,
          message: 'Target project not found or you do not own it.',
        });
        return;
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(projectId !== undefined && { projectId }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to delete it.',
      });
      return;
    }

    await prisma.task.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

