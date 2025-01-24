// src/docs/schemas/auth.schema.ts
export const authSchemas = {
    LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: {
                type: 'string',
                format: 'email',
                example: 'doc1@example.com'
            },
            password: {
                type: 'string',
                format: 'password',
                example: '********'
            }
        }
    },
    AuthResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                type: 'object',
                properties: {
                    token: {
                        type: 'string',
                        example: 'eyJhbGciOiJIUzI1NiIs...'
                    },
                    user: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                example: 'uuid-string'
                            },
                            email: {
                                type: 'string',
                                example: 'doc1@example.com'
                            },
                            role: {
                                type: 'string',
                                example: 'practitioner'
                            }
                        }
                    }
                }
            }
        }
    }
};