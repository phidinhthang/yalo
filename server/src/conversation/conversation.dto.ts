import { IsNotEmpty } from 'class-validator';

export class FindOrCreatePrivateConversationDto {
  @IsNotEmpty()
  partnerId: number;
}
