import { Body, Controller } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  async create(@Body() data: { phno: string; message: string }) {
    return await this.messageService.sendMessage(data.phno, data.message);
  }
}
