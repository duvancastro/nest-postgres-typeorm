import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  private readonly logger = new Logger('ProductService');
  constructor(@InjectRepository(Task) private taskRepo: Repository<Task>) {}

  async create(createTaskDto: CreateTaskDto) {
    try {
      const newTask = this.taskRepo.create(createTaskDto);
      const result = await this.taskRepo.save(newTask);
      return result;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  findAll() {
    return this.taskRepo.find();
  }

  findOne(id: string) {
    return this.taskRepo.findOneBy({ id: id });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);
    this.taskRepo.merge(task, updateTaskDto);
    return this.taskRepo.save(task);
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    else if (error.code === '23502')
      throw new BadRequestException(
        `The column '${error.column}' is required!s`,
      );
    this.logger.error(error);
    console.log(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs!',
    );
  }
}
