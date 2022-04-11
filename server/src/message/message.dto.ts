export class CreateMessageDto {
  text?: string;

  filesOrImages?: Express.Multer.File[];
}

export class ReplyMessageDto {
  text?: string
}