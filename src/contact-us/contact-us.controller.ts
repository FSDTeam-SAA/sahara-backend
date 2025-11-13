import { Body, Controller, Post } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  async sendMessage(@Body() dto: CreateContactDto) {
    return this.contactUsService.sendContactMessage(dto);
  }
}
