import { ApiProperty } from '@nestjs/swagger';

export class AuthSessionResponseDto {
  @ApiProperty({ description: 'Authenticated user id' })
  id!: string;

  @ApiProperty({ description: 'Authenticated user email' })
  email!: string;

  @ApiProperty({
    description: 'Authenticated user display name',
    nullable: true,
  })
  name!: string | null;

  @ApiProperty({
    description:
      "ISO8601 timestamp of when the current access token (and its HttpOnly cookie) expires. The frontend uses this to schedule a silent refresh shortly before it, instead of hardcoding the backend's token lifespan.",
    example: '2026-08-30T12:05:00.000Z',
  })
  expiresAt!: string;
}
