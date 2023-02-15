import { Global, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { UserService } from './user/user.service';
import { CourseService } from './course/course.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CourseController } from './course/course.controller';
import { UploadModule } from './upload/upload.module';
import { ProviceModule } from './provice/provice.module';




@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({secret: 'secretKey'}), UserModule, PassportModule, AuthModule, CategoryModule, CourseModule, UploadModule, ProviceModule],

  providers: [UserService, CourseService],
  exports: [JwtModule, PassportModule]

})
export class AppModule { }
