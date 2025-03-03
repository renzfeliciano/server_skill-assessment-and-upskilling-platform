class QueryHelperUtils {
    async getDocuments(model, options = {}, filters = {}) {
        try {
            const {
                page = 1,                // Default to page 1
                limit = 10,              // Default limit to 10 items per page
                sortField = 'createdAt', // Default sort field
                sort = 'asc',            // Default sort order
                selectFields = null,     // Optional: Fields to include/exclude in the response
                populate = null          // New parameter for population
            } = options

            // Calculate pagination
            const skip = (page - 1) * parseInt(limit)
            const sortOptions = { [sortField]: sort === 'asc' ? 1 : -1 }

            // Fetch the total count before pagination (for accurate total count)
            const totalCount = await model.countDocuments({
                ...filters,
            })
            
            // Query the records with filters, sorting, pagination, and non-deleted
            const query = model.find({
                ...filters,
            })
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit))
                .select(selectFields)

            // Optionally populate fields
            if (populate) {
                query.populate(populate) // Use the population options passed from the service
            }

            // Execute the query
            const records = await query.lean()

            // Return paginated response
            return {
                total: totalCount,
                records,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                limit: parseInt(limit),
            }
        } catch (error) {
            throw new Error('Error on retrieving documents: ' + error.message)
        }
    }

    async getDocument(model, filters = {}, options = {}) {
        try {
            const { 
                selectFields = null, 
                populateFields = null 
            } = options
    
            // Build the query
            let query = model.findOne(filters)
    
            // Apply select fields if provided
            if (selectFields) {
                query = query.select(selectFields)
            }
    
            // Apply populate if needed (e.g., relations like manager)
            if (populateFields) {
                query = query.populate(populateFields)
            }
    
            // Execute the query
            const document = await query.exec()
            return document ?? null
        } catch (error) {
            // Pass error handling up the chain
            throw new Error(`Error on retrieving document: ${error.message}`)
        }
    }

    async getDocumentById(model, id, selectFields = null) {
        try {
            const query = model.findById(id)

            if (selectFields) {
                query.select(selectFields)
            }

            const document = await query

            if (!document) {
                throw new Error('Document not found.')
            }

            return document
        } catch (error) {
            throw new Error('Error on retrieving document by id: ' + error.message)
        }
    }

    async createDocument (model, data) {
        try {
            const newDocument = await model.create(data)
            return newDocument._doc
        } catch (error) {
            throw new Error('Error on creating document: ' + error.message)
        }
    }

    async updateDocument (model, filter, data, options = {}) {
        try {
            const { 
                selectFields = null, 
                returnNewDocument = true 
            } = options

            // Perform the update
            const updatedDocument = await model.findOneAndUpdate(
                filter, // Dynamic filter object
                { $set: data },
                { new: returnNewDocument, runValidators: true, select: selectFields }
            )

            // Check if the document was found and updated
            if (!updatedDocument) {
                throw new Error('Document not found or failed to update.')
            }

            return updatedDocument
        } catch (error) {
            throw new Error('Error on updating document: ' + error.message)
        }
    }

    async updateDocumentById(model, id, data, options = {}) {
        try {
            const { selectFields = null, returnNewDocument = true } = options

            const updatedDocument = await model.findByIdAndUpdate(
                id,
                { $set: data },
                { new: returnNewDocument, runValidators: true, select: selectFields }
            )

            if (!updatedDocument) {
                throw new Error('Document not found or failed to update.')
            }

            return updatedDocument
        } catch (error) {
            throw new Error('Error on updating document by id: ' + error.message)
        }
    }

    async deleteDocument(model, filter, softDelete = true) {
        try {
            if (softDelete) {
                // Soft delete: Set a `deleted` flag instead of deleting the document
                const updatedDocument = await model.findOneAndUpdate(
                    filter, // Dynamic filter object
                    { $set: { isDeleted: true } }, // Assuming there's a `deleted` field in the schema
                    { new: true }
                )

                if (!updatedDocument) {
                    throw new Error('Document not found or already deleted.')
                }

                return updatedDocument
            } else {
                // Hard delete: Permanently remove the document
                const deletedDocument = await model.findOneAndDelete(filter) // Dynamic filter object

                if (!deletedDocument) {
                    throw new Error('Document not found or already deleted.')
                }

                return deletedDocument
            }
        } catch (error) {
            throw new Error('Error on deleting document: ' + error.message)
        }
    }

    async deleteDocumentById(model, id, softDelete = true) {
        try {
            if (softDelete) {
                // If soft delete is enabled, we simply set a `deleted` flag instead of removing it
                const updatedDocument = await model.findByIdAndUpdate(
                    id,
                    { $set: { deleted: true } }, // Assuming there's a `deleted` field in the schema
                    { new: true }
                )

                if (!updatedDocument) {
                    throw new Error('Document not found or already deleted.')
                }

                return updatedDocument
            } else {
                // Hard delete (permanent)
                const deletedDocument = await model.findByIdAndDelete(id)

                if (!deletedDocument) {
                    throw new Error('Document not found or already deleted.')
                }

                return deletedDocument
            }
        } catch (error) {
            throw new Error('Error on deleting document by id: ' + error.message)
        }
    }

    async countDocuments(model, filters = {}) {
        try {
            const count = await model.countDocuments({ ...filters })
            return count
        } catch (error) {
            throw new Error('Error on counting document: ' + error.message)
        }
    }
}

export default new QueryHelperUtils()