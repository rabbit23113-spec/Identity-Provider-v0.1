import { OutboxAction, OutboxDomain } from '../../entities/outbox.repository';

export class CreateEventDto {
  domain: OutboxDomain;
  action: OutboxAction;
  payload: Record<string, any>;
}
