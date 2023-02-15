
import { RegisterDataDto, } from './dto/register_data_dto';
import { UserDto } from './dto/user_data_dto';
import { User, UserService } from './user.service';
import { Body, Controller, Get, Post, Headers, Response, Request, Req, HttpStatus, HttpException, UseGuards, Delete, Param, Put, UnauthorizedException } from '@nestjs/common';
import { CourseService } from 'src/course/course.service';
import AuthGuard from 'Guards/AuthGuard';
@Controller('user')
export class UserController {
    constructor(private userService: UserService, private courseServiec: CourseService) { }

    @Get('alluser')
    async GetAllUser(): Promise<any> {
        return await this.userService.findAllUser()
    }

    @Get('allteacher')
    async GetAllTeacher(): Promise<any> {
        return await this.userService.findAllTeacher()
    }

    @Post('register')
    async Register(@Body() data: any): Promise<User> {

        const data_register = await this.userService.Register(data)
        return data_register
    }

    @Delete('deleteuser/:id')
    async DeleteUser(@Param('id') id: string) {
        console.log("delete user success !!")
        await this.userService.DeleteUser(id);
    }

    @Put('updateuser/:id')
    async UpdateUser(@Param('id') id: string, @Body() userDto: any) {
        console.log("update user success !!")
        return await this.userService.updateUser(id, userDto);
    }

    @Get('getdetailuser/:id')
    async GetDetailUser(@Param('id') id: string) {
        return await this.userService.GetDetailUser(id)
    }

    @Get('getuser')
    async Getuser() {
        return await this.userService.getUser()
    }

    @Get('getfavoritefromid/:id')
    async GetFavoriteAll(@Param('id') id: string) {
        const get_all_course = await this.courseServiec.FindAllCourse()
        return await this.userService.GetFavorite(id, get_all_course)

    }
    @Put('addfavorite/:id')
    async AddFavorite(@Param('id') id: string, @Body() Course: any) {
        return await this.userService.AddFavorite(id, Course)
    }

    @Get('getjoincoursefromid/:id')
    async GetJoinCourseAll(@Param('id') id: string) {
        const get_all_course = await this.courseServiec.FindAllCourse()
        return await this.userService.GetCourse(id, get_all_course)

    }
    @Put('addjoincourse/:id')
    async AddJoinCourse(@Param('id') id: string, @Body() Course: any) {
        return await this.userService.AddCourse(id, Course)
    }


    @Put('updatepassword/:id')
    async UpdatePassword(@Param('id') id: string, @Body() password: string) {
        console.log('password = ', password)
        throw new UnauthorizedException('test')
        return await this.userService.UpdatePassword(id, password)
    }
}


