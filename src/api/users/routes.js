import { Router } from "express"
import MiddlewareUtils from "../../utils/middleware.js"
import UserController from "./controller.js"
import UserValidation from "./validation.js"

const UserRoutes = Router()

UserRoutes
    .get('', MiddlewareUtils.validateRequest(UserValidation.list), UserController.list)

export default UserRoutes