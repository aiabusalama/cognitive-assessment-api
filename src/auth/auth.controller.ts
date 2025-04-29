import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'User login', 
    description: 'Authenticates user and returns JWT token' 
  })
  @ApiBody({ 
    type: LoginDto,
    examples: {
      valid: {
        summary: 'Valid login',
        value: {
          email: 'user@example.com',
          password: 'SecurePassword123!'
        }
      },
      invalid: {
        summary: 'Invalid login',
        value: {
          email: 'user@example.com',
          password: 'wrongpassword'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successful login',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid request payload',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password must be a string'],
        error: 'Bad Request'
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized'
      }
    }
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ 
    summary: 'User registration', 
    description: 'Creates a new user account' 
  })
  @ApiBody({ 
    type: RegisterDto,
    examples: {
      valid: {
        summary: 'Valid registration',
        value: {
          email: 'user@example.com',
          password: 'SecurePassword123!'
        }
      },
      invalid: {
        summary: 'Invalid registration',
        value: {
          email: 'invalid-email',
          password: 'short'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    schema: {
      example: {
        message: 'Registration successful'
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid request payload',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password must be at least 8 characters'],
        error: 'Bad Request'
      }
    }
  })
  @ApiConflictResponse({ 
    description: 'Email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email already in use',
        error: 'Conflict'
      }
    }
  })
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto.email, registerDto.password);
    return { message: 'Registration successful' };
  }
}
