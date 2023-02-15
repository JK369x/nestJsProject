import { query } from 'firebase/firestore';
import { Injectable, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDataDto } from './dto/register_data_dto';
import * as bcrypt from 'bcrypt'
import { collection_account } from 'src/database/firebase/firebase_config';

export type User = any;

@Injectable()
export class UserService {
    constructor(private jwtSerVice: JwtService,) { }

    public user: any;

    async setUser(user: any) {
        console.log("set user success !!")
        this.user = user;
    }

    async getUser() {
        if (this.user) {
            console.log('get usear success !!')
            return this.user;
        } else {
            console.log('fail get user!!')
            return false
        }
    }

    async findOneUser(email: string): Promise<User | undefined> {
        const user = await collection_account.where('email', '==', email).get()
        if (user.docs.length > 0) {
            return user.docs
        } else {
            throw new InternalServerErrorException({ message: 'not found email!' })
        }
    }

    async GetDetailUser(id: string): Promise<User | undefined> {
        const user = await collection_account.doc(id).get()
        console.log("🚀 ~ file: user.service.ts:36 ~ UserService ~ GetDetailUser ~ user", user.data())
        return { ...user.data(), id_document: user.id }
    }

    async findAllUser(): Promise<User | undefined> {
        const userAll = await collection_account.orderBy("email", "desc").get()
        const data = userAll.docs.map((item, index) => {
            return { ...item.data(), id_document: item.id }
        })
        if (data) {
            return data
        } else {
            throw new InternalServerErrorException({ message: 'not found all user' })
        }
    }

    async findAllTeacher(): Promise<User | undefined> {
        console.log('get teacher')
        const userAll = await collection_account.where('status.id', '==', "4").get()
        const data = userAll.docs.map((item, index) => {
            return { ...item.data(), id_document: item.id }
        })
        if (data) {
            return data
        } else {
            throw new InternalServerErrorException({ message: 'not found all user' })
        }
    }

    async DeleteUser(id: string): Promise<User | undefined> {
        console.log("🚀 ~ file: user.service.ts:58 ~ UserService ~ DeleteUser ~ id", id)
        return await collection_account.doc(id).delete();

    }

    async updateUser(id: string, userDto: any) {
        console.log("user update :", userDto)
        return await collection_account.doc(id).update(userDto);
    }

    async Register(register: RegisterDataDto): Promise<User> {
        const salt = bcrypt.genSaltSync()
        const password = bcrypt.hashSync(register.password, salt)
        try {
            let newdata: any = register
            delete newdata.confirmPassword
            const result = await collection_account.add({
                ...newdata,
                salt: salt,
                password,
                createDate: new Date(),
                updateDate: new Date(),
            })
            if (result) {
                console.log("🚀 register success id = ", result.id)
            } else {
                console.log('register fail!!')
            }
            return result

        } catch (err) {
            console.log(err)
            return false
        }
    }
    async UpdatePassword(id: string, password: any) {
        const salt = password.salt
        console.log("🚀 ~ file: user.service.ts:108 ~ UserService ~ UpdatePassword ~ salt", salt)
        const password_salt = password.password_salt
        console.log("🚀 ~ file: user.service.ts:110 ~ UserService ~ UpdatePassword ~ password_salt", password_salt)
        console.log('update password')
        // return false
        return await collection_account.doc(id).update({
            salt,
            password: password_salt
        })
    }

    async AddFavorite(id: string, params: string[]): Promise<any> {
        console.log(`add favorite :${params} doc id user:${id}`)
        return await collection_account.doc(id).update({
            favorite: params
        })
    }

    async GetFavorite(id: string, course_favorite: any) {
        console.log("🚀 ~ file: user.service.ts:101 ~ UserService ~ GetFavorite ~ id", id)
        const user = await collection_account.doc(id).get()
        const favorite_firebase = user.data().favorite
        console.log("user favorite course:", favorite_firebase)
        const newdata = course_favorite.filter((item: any) => favorite_firebase?.includes(item.id_document))
        return newdata
    }


    async AddCourse(id: string, params: string[]): Promise<any> {
        console.log(`add favorite :${params} doc id user:${id}`)
        return await collection_account.doc(id).update({
            course_join: params
        })
    }

    async GetCourse(id: string, course_course: any) {
        console.log("get join course id", id)
        const user = await collection_account.doc(id).get()
        const join_course_firebase = user.data().join_course
        console.log("join course ", join_course_firebase)
        const newdata = course_course.filter((item: any) => join_course_firebase?.includes(item.id_document))
        return newdata
    }

    // async SearchUser(){
    //     const user =  await collection_account.where('createDate','','').get()
    // }

}
