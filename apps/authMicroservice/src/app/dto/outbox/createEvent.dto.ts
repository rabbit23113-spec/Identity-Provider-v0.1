import { OutboxAction, OutboxDomain } from '../../repositories/outbox.repository';

export class CreateEventDto {
  domain: OutboxDomain;
  action: OutboxAction;
  payload: Record<string, any>;
}
