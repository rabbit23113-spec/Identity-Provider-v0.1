import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandsService } from './commands/app.commands';
import { QueriesService } from './queries/app.queries';

@Module({
  imports: [
    TypeOrmModule.forRoot()
  ],
  controllers: [AppController],
  providers: [CommandsService, QueriesService],
})
export class AppModule {}
