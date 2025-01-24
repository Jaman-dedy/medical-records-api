// src/docs/routes/auth.ts
export const createAuthDocs = () => ({
    login: `
/auth/login:
  post:
    tags:
      - Authentication
    summary: Login user (patient or practitioner)
    description: Authenticate user and return JWT token
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/LoginRequest'
    responses:
      200:
        description: Login successful
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AuthResponse'
      400:
        description: Invalid input
      401:
        description: Authentication failed
      500:
        description: Server error`,

    refreshToken: `
/auth/refresh-token:
  post:
    tags:
      - Authentication
    summary: Refresh JWT token
    security:
      - bearerAuth: []
    responses:
      200:
        description: Token refreshed successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AuthResponse'
      401:
        description: Invalid token`,

    logout: `
/auth/logout:
  post:
    tags:
      - Authentication
    summary: Logout user
    security:
      - bearerAuth: []
    responses:
      200:
        description: Logout successful
        content:
          application/json:
            schema:
              type: object
              properties:
                success:
                  type: boolean
                message:
                  type: string
      401:
        description: Unauthorized`
});

export const authDocs = createAuthDocs();