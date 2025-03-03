import UserService from "./service.js"

class UserController {
    async list(req, res, next) {
        try {
            const result = await UserService.list(req.query)
            res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }
}

export default new UserController()