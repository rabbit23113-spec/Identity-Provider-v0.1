import { Controller } from '@nestjs/common';
import { CommandsService } from './commands/app.commands';
import { QueriesService } from './queries/app.queries';

@Controller()
export class AppController {
  constructor(
    private readonly commandsService: CommandsService,
    private readonly queriesService: QueriesService,
  ) {}
}
