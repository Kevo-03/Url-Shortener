import { IsUrl } from 'class-validator';

export class CreateUrlDto {
    @IsUrl({ require_tld: false })
    url: string;
}