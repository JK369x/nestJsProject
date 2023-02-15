import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiBody } from '@nestjs/swagger'

@Controller('upload')
export class UploadController {
    constructor(private uploadfile: UploadService) { }
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @Post('upload')
    @UseInterceptors(FileInterceptor('files'))
    uploadFile(@UploadedFile() files: Express.Multer.File[]) {
        console.log(files)
        return 'test'
    }
}
