import { Controller } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(
    private readonly commandsService: CommandsService,
    private readonly queriesService: QueriesService,
  ) {}
}
