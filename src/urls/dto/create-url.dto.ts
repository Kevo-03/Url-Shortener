import { IsString, IsUrl } from 'class-validator';

export class CreateUrlDto {
    @IsUrl({ require_tld: false })
    @IsString()
    url: string;
}