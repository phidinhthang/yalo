export class CreateMessageDto {
  text?: string;

  filesOrImages?: Express.Multer.File[];
}
