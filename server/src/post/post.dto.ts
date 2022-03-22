import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  text: string;
}

export class CreateCommentDto {
  @IsNotEmpty()
  text: string;
}
