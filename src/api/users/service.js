import User from "../users/model.js"
import QueryHelperUtils from "../../utils/queryHelper.js"

class UserService {
    async list(query) {
        const { page, limit, sortField, sort, ...filters } = query
        const options = {
            page,
            limit,
            sortField,
            sort,
        }
        options.selectFields = '_id name email'
        // Optionally set default filters
        filters.isActive = filters.isActive ?? true // Default to active users
        const list = await QueryHelperUtils.getDocuments(User, options, filters)
        return list
    }
}

export default new UserService()