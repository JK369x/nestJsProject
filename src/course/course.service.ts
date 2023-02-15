import { collection_score, collection_account } from './../database/firebase/firebase_config';
import { getDoc } from 'firebase/firestore';
import { ref } from 'firebase/storage';
import { async } from '@firebase/util';
import { query } from 'firebase/firestore';
import { Quiz } from '@mui/icons-material';
import { getDocs } from 'firebase/firestore';
import { doc } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { Injectable, InternalServerErrorException, HttpException, Param, UnauthorizedException } from '@nestjs/common';
import { AddCourseDTO } from './dto/course_data.dto';
import { collection_course } from 'src/database/firebase/firebase_config';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ResultOption } from 'Guards/jwtInterface';

@Injectable()
export class CourseService {
    constructor(private userService: UserService, private jwtService: JwtService,) { }
    async FindAllCourse() {
        const findAllCourse = await collection_course.orderBy("createDate", "desc").get()
        const data = findAllCourse.docs.map((item, index) => {
            return { ...item.data(), id_document: item.id, }
        })
        if (data) {
            return data
        } else {
            throw new InternalServerErrorException({ message: 'not found all user' })
        }
    }

    async DeleteCourse(id: string) {
        console.log("success delete course!!", id)
        return await collection_course.doc(id).delete();
    }

    async GetDetailCourse(id: string) {
        const category = await collection_course.doc(id).get()
        return { ...category.data(), id: category.id }
    }

    async EditCourse(id: string, course: any) {
        console.log("course update :", course)
        return await collection_course.doc(id).update(course);
    }

    async UpdateApproval(id: string) {
        return await collection_course.doc(id).update({
            approval: true
        });
    }

    async UpdateCheckName(id: string, status: any) {
        console.log("update status", status)
        await collection_course.doc(id).update({
            btn_check_name: status
        });
        return status
    }

    async UpdateComment(id: string, status: any) {
        console.log("update status", status)
        await collection_course.doc(id).update({
            btn_comment: status
        });
        return status
    }
    async addCourse(addcourse: any, user: any) {
        console.log("🚀 ~ file: course.service.ts:61 ~ CourseService ~ addCourse ~ user", user.image_rul)

        try {
            const result = await collection_course.add({
                ...addcourse,
                approval: false,
                pricing: Number(addcourse.pricing),
                create_byName: user.display_name,
                create_status: user.status,
                createDate: new Date(),
                updateDate: new Date(),
                btn_quiz: false,
                btn_check_name: false,
                btn_comment: false,
                image_create: user.image_rul,
                create_by_id: user.id_document,
            })
            if (result) {
                console.log("🚀 add course success id = ", result.id)
            } else {
                console.log('register fail!!')
            }
            return result
        } catch (err) {
            console.log(err)
            return false
        }
    }

    async ApprovalLists() {
        const data_approval = await collection_course.where("approval", "==", false).get()
        const new_data = data_approval.docs.map((item: any) => {
            return { ...item.data(), id_document: item.id }
        })
        return new_data
    }


    async JoinCourse(cookie: any, course_id: string, allcourse: any) {
        console.log(" course id = ", course_id)
        const course = allcourse.find((item: any) => {
            return item.id_document === course_id
        })
        const user = this.jwtService.verify<any>(cookie)
        console.log(" find course = ", course)
        console.log(" user id join course = ", user.payload)
        try {
            await collection_course.doc(course_id).collection("Join").add({
                id_user: user.payload.id_document,
                email_user: user.payload.email,
                approval: false,
                name_join: user.payload.display_name,
                courseName: course.title,
                image_course: course.image,
                pricing: Number(course.pricing),
                transaction: false,
                image_user: user.payload.image_rul ? user.payload.image_rul : ''
            })
            return true

        } catch (err) {
            console.log("🚀 ~ file: course.service.ts:84 ~ CourseService ~ JoinCourse ~ err", err)
        }
    }



    async OutCourse(cookie: any, outcourse: string) {
        console.log("🚀 ~ file: course.service.ts:104 ~ CourseService ~ OutCourse ~ outcourse", outcourse)
        const user = this.jwtService.verify<any>(cookie)
        const ref_course = await collection_course.doc(outcourse).collection("Join").where("id_user", "==", user.payload.id_document).get()
        const new_data = ref_course.docs.map((item: any) => {
            return { ...item.data(), join_course: item.id }
        })

        const id_join_course = new_data.map((params: any) => {
            return params.join_course
        })
        console.log("🚀 ~ file: course.service.ts:114 ~ CourseService ~ constid_join_course=new_data.map ~ id_join_course", id_join_course)
        try {
            await collection_course.doc(outcourse).collection("Join").doc(id_join_course[0]).delete()
            return true

        } catch (err) {
            console.log("🚀 ~ file: course.service.ts:84 ~ CourseService ~ JoinCourse ~ err", err)
        }
    }


    async GetAlljoinCourse(id_course: string) {
        const ref_course = await collection_course.doc(id_course).collection("Join").where("approval", "==", false).get()
        const newdata = ref_course.docs.map((item) => {
            return { ...item.data(), join_course: item.id }
        })
        return newdata
    }

    async UpdateImageReceipt(course_id: string, id_user: string, image: any, date_transaction: any) {
        try {
            const ref_course = await collection_course.doc(course_id).collection("Join").where("id_user", "==", id_user).get()
            const id_join = ref_course.docs.map((item) => {
                return { id_join_course: item.id }
            })

            const newdata = id_join[0].id_join_course
            await collection_course.doc(course_id).collection("Join").doc(newdata).update({
                image,
                date_transaction
            })
            return true
        } catch (err) {
            console.log("🚀 ~ file: course.service.ts:84 ~ CourseService ~ JoinCourse ~ err", err)
        }
    }

    async GetCheckNameBtn(id_course: string) {
        console.log("🚀 ~ file: course.service.ts:153 ~ CourseService ~ GetCheckNameBtn ~ id_course", id_course)
        const ref_course = await collection_course.doc(id_course).get()
        const newdata = await ref_course.data().btn_check_name
        return newdata
    }

    async GetCheckCommentBtn(id_course: string) {
        console.log("🚀 ~ file: course.service.ts:153 ~ CourseService ~ GetCheckNameBtn ~ id_course", id_course)
        const ref_course = await collection_course.doc(id_course).get()
        const newdata = await ref_course.data().btn_comment
        return newdata
    }
    async GetallComment(id_course: string) {
        console.log("🚀 ~ file: course.service.ts:153 ~ CourseService ~ GetCheckNameBtn ~ id_course", id_course)
        const ref_course = await collection_course.doc(id_course).collection("Comment").get()
        const data = ref_course.docs.map((item: any, index: number) => {
            return { ...item.data(), id_document: item.id }
        })
        return data
    }

    async GetStatusBtnCheckName(id_course: string) {
        const ref_course = await collection_course.doc(id_course).collection("Join").where("approval", "==", true).get()
        const newdata = ref_course.docs.map((item) => {
            return { ...item.data(), join_course: item.id }
        })
        return newdata
    }
    async UpdateApprovalJoinCourse(id_course: string, id_document: string) {
        return await collection_course.doc(id_course).collection("Join").doc(id_document).update({
            approval: true,
            transaction: true,
        });
    }
    async DeleteJoinCourse(id_course: string, id_document: string) {
        console.log("success delete Join course!!", id_course)
        return await collection_course.doc(id_course).collection("Join").doc(id_document).delete();
    }
    async DeleteComment(id_course: string, id_comment: string) {
        console.log('id course :', id_course)
        console.log('id comment :', id_comment)
        return await collection_course.doc(id_course).collection("Comment").doc(id_comment).delete()
    }
    async CheckName(id_course: string, user: any) {
        console.log("first time check name", id_course)
        const data = await collection_course.doc(id_course).collection("CheckName").where('id_user', '==', user.payload.id_document).get()
        console.log('data = ', data.docs.length)
        if (data.docs.length === 0) {
            console.log('check name success !!')
            return await collection_course.doc(id_course).collection("CheckName").add({
                name: user.payload.display_name,
                status: user.payload.status,
                id_user: user.payload.id_document,
                date_check_name: new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }),
            })
        } else {
            const newdata = data.docs.map((item: any) => {
                return { ...item.data(), id_document: item.id }
            })
            const day = newdata.map(async (day: any) => {
                try {
                    console.log("==================")
                    const old_check = new Date(day.date_check_name).toLocaleDateString()
                    console.log("old  in firebase !!", old_check)
                    const date_now = new Date().toLocaleDateString()
                    console.log("date now !!", date_now)
                    if (old_check === date_now) {
                        console.log('data same!!', date_now)
                        throw new Error(`Can't check!`)
                    } else {
                        console.log('=====check name!!======')
                        await collection_course.doc(id_course).collection("CheckName").add({
                            name: user.payload.display_name,
                            status: user.payload.status,
                            id_user: user.payload.id_document,
                            date_check_name: new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }),
                        })
                        return true
                    }
                } catch (err) {
                    console.log("🚀 ~ file: course.service.ts:207 ~ CourseService ~ day ~ err", err)
                }
            })
            return day
        }
    }

    async CommentCourse(id_course: string, user: any, comment_course: any) {
        console.log("comment_course", comment_course)
        console.log("first time comment", id_course)
        const data = await collection_course.doc(id_course).collection("Comment").where('id_user', '==', user.payload.id_document).get()
        console.log('data = ', data.docs.length)
        if (data.docs.length === 0) {
            console.log('create comment !!')
            return await collection_course.doc(id_course).collection("Comment").add({
                ...comment_course
            })
        } else {
            console.log('err!!')
        }
    }
    async CreateQuiz(id_course: string, quiz: any) {
        console.log("Quiz :", quiz)
        collection_course.doc(id_course).collection("Quiz").add({
            quiz,
            status_quiz: "false",
            title: quiz.newdata,
            createDateTime: new Date().toLocaleDateString()
        })
        return true
    }



    async DeleteQuiz(id_course: string, id_document: string) {
        collection_course.doc(id_course).collection("Quiz").doc(id_document).delete()
        console.log("Delete Quiz Id !! :", id_document)
        console.log("From Course Id !! :", id_course)
        return true
    }

    async GetDetailQuiz(id_course: string, id_quiz: string) {
        console.log('Get Detail Quiz....')
        try {
            const getquiz = await collection_course.doc(id_course).collection("Quiz").doc(id_quiz).get()
            console.log("getquiz", getquiz.data())
            return { ...getquiz.data(), id: getquiz.id }

        } catch (err) {
            console.log("🚀 ~ file: course.service.ts:249 ~ CourseService ~ GetDetailQuiz ~ err", err)
        }
    }


    async GetAllQuiz(id_course: string) {
        const data = await collection_course.doc(id_course).collection("Quiz").orderBy("createDateTime", "asc").get()
        const findAllQuiz = data.docs.map((item: any, index: number) => {
            return { ...item.data(), id_document: item.id }
        })
        return findAllQuiz
    }

    async getStatusQuizBtn(id_course: string, id_quiz: string) {
        console.log("🚀 ~ file: course.service.ts:153 ~ CourseService ~ GetCheckNameBtn ~ id_course", id_course)
        const ref_course = await collection_course.doc(id_course).collection("Quiz").doc(id_quiz).get()
        console.log("🚀 ~ file: course.service.ts:264 ~ CourseService ~ getStatusQuizBtn ~ ref_course", ref_course)
        const newdata = await ref_course.data().status_quiz
        return newdata
    }
    async UpdateStatusQuiz(id_course: string, id_quiz: string, status: boolean) {
        console.log("🚀UpdateStatusQuiz ~ status", status)
        return await collection_course.doc(id_course).collection("Quiz").doc(id_quiz).update({
            status_quiz: status
        })
    }
    async UpdateReject(id_course: string, detail: string) {
        return await collection_course.doc(id_course).update({
            reject: detail,
        });
    }

    async GetAllNameCheck(id_course: string) {
        console.log("🚀 ~ file: course.service.ts:346 ~ CourseService ~ GetAllNameCheck ~ id_course", id_course)
        const data = await collection_course.doc(id_course).collection("CheckName").orderBy("date_check_name", "asc").get()
        const findAllNameCheck = data.docs.map((item: any, index: number) => {
            return { ...item.data(), id_document: item.id }
        })
        return findAllNameCheck
    }

    async GetCourseByID(id_user: string) {
        console.log("🚀 ~ file: course.service.ts:282 ~ CourseService ~ GetCourseByID ~ id_user", id_user)
        const data = await collection_course.where('create_by_id', '==', id_user).get()
        console.log("🚀 ~ file: course.service.ts:284 ~ CourseService ~ GetCourseByID ~ data", data.docs)

        const newdata = data.docs.map((item: any, index: number) => {
            return { ...item.data(), id_document: item.id }
        })
        return newdata
    }

    async GetCheckNameById(id_course: string, id_user: string) {
        const data = await collection_course.doc(id_course).collection("CheckName").where('id_user', '==', id_user).get()
        const findAllNameCheck = data.docs.map((item: any, index: number) => {
            return { ...item.data(), id_document: item.id }
        })
        return findAllNameCheck
    }
    async AddScoreQuiz(id_user: string, params: any) {
        const data = await collection_account.doc(id_user).collection("score").add({
            ...params,
            createDate: new Date(),
        })
        return data
    }
    async GetAllScoreQuizById(id_user: string) {
        const data = await collection_account.doc(id_user).collection("score").get()
        return data.docs.map((item: any, index: number) => {
            return { ...item.data(), id_document: item.id }
        })
    }
}
