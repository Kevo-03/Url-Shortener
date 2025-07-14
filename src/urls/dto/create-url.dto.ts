import { IsOptional, IsString, IsUrl, IsInt, Max } from 'class-validator';

export class CreateUrlDto {
    @IsUrl({ require_tld: false })
    @IsString()
    url: string;

    @IsOptional()
    @IsOptional()
    @IsInt()
    @Max(60 * 60 * 24 * 90)
    ttl?: number;
}