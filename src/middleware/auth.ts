import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';


export function authMiddleware(req: NextRequest){
    console.log('req :>> ', req);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if(!token){
        console.error('No token existed')
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});

    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        console.log('decoded :>> ', decoded);
        (req as any).user = decoded as {id: number; role: string};
        return NextResponse.next();
    } catch (error){
        return NextResponse.json({error: 'Invalid Token'}, {status: 401});
    }

}
    export function roleMiddleware(roles: string[]){
        return function(req: NextRequest){
            if(roles.includes((req as any).user.role)){
                return NextResponse.next();
            } else {
                return NextResponse.json({error: 'Forbidden'}, {status: 403});
            }
        };
    }


