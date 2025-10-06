import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from './services/file-upload.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class CommonModule {}
