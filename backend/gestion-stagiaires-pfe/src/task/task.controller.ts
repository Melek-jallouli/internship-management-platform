import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { TasksService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { Request } from 'express';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
   async create(@Body() Dto: any) {
    return await this.tasksService.create(Dto);
  }

  @Get('my-tasks')
  @UseGuards(JwtAuthGuard)
  async getMyTasks(@Req() req: any) {
    // Ici, le 'sub' ou 'userId' est celui du stagiaire
    const stagiaireId = req.user?.['userId']; 
    return await this.tasksService.findByStagiaire(stagiaireId);
}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllByEncadrant(@Req() req: Request) {
    // On récupère l'ID de l'encadrant depuis le token JWT
    const encadrantId = req.user?.['userId'];
    return await this.tasksService.findAllByEncadrant(encadrantId);
  }

  @Get('pfe/:idPfe')
  findByPfe(@Param('idPfe') idPfe: string) {
    return this.tasksService.findByPfe(+idPfe);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id', ParseIntPipe) id: string, @Body('statut') statut: string) {
    return this.tasksService.updateStatus(+id, statut);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.tasksService.remove(+id);
  }
}