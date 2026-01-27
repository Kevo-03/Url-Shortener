import { IsOptional, IsString, IsUrl, IsInt, Max } from 'class-validator';

export class CreateUrlDto {
    @IsUrl({
        require_protocol: true,
        require_tld: false
    }, {
        message: 'The URL must be a valid URL address and start with http:// or https://'
    })
    @IsString()
    url: string;

    @IsOptional()
    @IsInt()
    @Max(60 * 60 * 24 * 90)
    ttl: number;
}