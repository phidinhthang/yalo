import { IsNotEmpty, MinLength, ArrayMinSize } from 'class-validator';

export class FindOrCreatePrivateConversationDto {
  @IsNotEmpty()
  partnerId: number;
}

export class CreateGroupConversationDto {
  @IsNotEmpty()
  title: string;

  @ArrayMinSize(2)
  memberIds: number[];
}
