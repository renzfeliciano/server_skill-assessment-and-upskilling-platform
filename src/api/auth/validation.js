import Joi from "joi"
import CONSTANTS from "../../shared/constants.js"

const name = Joi.object({
    first: Joi.string()
        .required()
        .messages({
            'string.empty': '"First name" cannot be empty.',
            'any.required': '"First name" is required.'
        }),
    middle: Joi.string()
        .optional()
        .allow('')
        .messages({
            'string.base': '"Middle name" must be a string.'
        }),
    last: Joi.string()
        .required()
        .messages({
            'string.empty': '"Last name" cannot be empty.',
            'any.required': '"Last name" is required.'
        })
})

const email = Joi.string()
    .email({
        allowFullyQualified: true,
        minDomainSegments: 2,
        tlds: { allow: CONSTANTS.ALLOWED_REGISTRATION_DOMAINS } // You can customize this list as needed
    })
    .required()
    .messages({
        'string.empty': '"Email" cannot be empty.',
        'any.required': '"Email" is required.',
        'string.email': '"Email" must be a valid email address.'
    })

const password = Joi.string()
    .required()
    .messages({
        'string.empty': '"Password" cannot be empty.',
        'any.required': '"Password" is required.'
    })

const accountId = Joi.string()
    .required()
    .messages({
        'string.empty': '"Refresh Token" cannot be empty.',
        'any.required': '"Refresh Token" is required.'
    })

const refreshToken = Joi.string()
    .required()
    .messages({
        'string.empty': '"Refresh Token" cannot be empty.',
        'any.required': '"Refresh Token" is required.'
    })


class AuthValidation {
    login = Joi.object({
        email,
        password
    }).unknown(false)

    register = Joi.object({
        name,
        email,
        password
    }).unknown(false)

    refreshToken = Joi.object({
        accountId,
        refreshToken
    }).unknown(false)
}

export default new AuthValidation()