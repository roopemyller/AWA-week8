import {Request, Response, Router} from "express"
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import {User} from './models/User'
import inputValidation from './validators/inputValidation'
import { validationResult } from 'express-validator';


const router: Router = Router()

router.post('/api/user/register/', inputValidation.register, async (req: Request, res: Response) => {
    const {email, password, username, isAdmin} = req.body

    console.log(req.body)

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        res.status(400).json({ errors: errors.array() });
        return
    }

    if (!email || !password){
        res.status(400).json({message: 'No email or password'})
        return
    }

    const userExists = await User.findOne({email})
    if(userExists){
        res.status(403).json({message: 'Email is already registered'})
        return
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            email,
            password: hashedPassword,
            username,
            isAdmin: isAdmin !== undefined ? isAdmin : false
        })

        await newUser.save()
        
        res.status(200).json(newUser)
        return
    } catch (error) {
        console.log(error)
    }
})

router.post('/api/user/login', inputValidation.login, async (req: Request, res: Response) => {
    const {email, password} = req.body

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return
    }

    if (!email || !password){
        res.status(400).json({message: 'No email or password'})
        return
    }

    try {
        const user = await User.findOne({email})
        if(!user){
            res.status(404).json({message: 'User not found'})
            return
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if(!isPasswordValid){
            res.status(401).json({message: 'Invalid credentials'})
            return
        }
        const token = jwt.sign({ _id: user._id, username: user.username, isadmin: user.isAdmin }, process.env.SECRET!, { expiresIn: '1h' })

        res.status(200).json({token})
        return
    } catch (error) {
        console.log(error)
    }
})

router.post('/api/user/logout', (req: Request, res: Response) => {
    res.clearCookie('token')
    res.status(200).json({message: "Logged out successfully"})
    return
})

export default router