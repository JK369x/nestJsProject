import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from "express";

@Injectable()
export class AuthMiddleWare implements NestMiddleware {
    constructor(private jwtService: JwtService) { }
    async use(req: Request, res: Response, next: NextFunction,) {
        console.log("=================AuthMiddleWare🪝=================")
        const token = req.cookies.access_token
        console.log("🚀 ~ file: authmiddleware.ts:13 ~ AuthMiddleWare ~ use ~ tokens")
        try {
            if (token == undefined) {
                next()
            }
            else {
                console.log("get token")
                const verify_acc = await this.jwtService.verify(token)
                next()
            }
        } catch (err) {
            return console.log("don't have token", err)
        }
    }
}