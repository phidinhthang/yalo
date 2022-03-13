import { IsNotEmpty, MinLength, ArrayMinSize } from 'class-validator';

export class FindOrCreatePrivateConversationDto {
  @IsNotEmpty()
  partnerId: number;
}

export class CreateGroupConversationDto {
  @IsNotEmpty({ message: 'empty' })
  title: string;

  @ArrayMinSize(2, { message: 'minSize' })
  memberIds: number[];
}

export class ChangeTitleDto {
  @IsNotEmpty()
  title: string;
}
