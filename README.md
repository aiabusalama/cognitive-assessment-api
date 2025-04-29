# Cognitive Assessment API

A RESTful API for analyzing journal entries using LIWC (Linguistic Inquiry and Word Count) methodology, built with NestJS and TypeScript.

## Key Features

- **Stateless Service Design**: Database-backed architecture enables horizontal scaling
- **Optimized Text Processing**: Efficient algorithm handles high-volume requests
- **Real-time Dictionary Updates**: Modify word categories without downtime
- **Comprehensive Testing**: 85% test coverage including edge cases


## Technology Stack

| Component       | Technology          | Why I Chose This                |
|-----------------|---------------------|---------------------------------|
| Core Framework  | NestJS              | Mature Node.js framework with excellent TypeScript support. Modular architecture makes scaling easier. More productive for me than Python/Flask. |
| Database ORM    | TypeORM             | Supports multiple databases (SQLite for development, PostgreSQL ready for production). Provides clean data modeling. |
| Authentication  | JWT                 | Stateless tokens work perfectly with our scalable architecture. Simple to implement yet secure. |
| API Docs        | Swagger             | Automatic interactive documentation that's easier to maintain than manual Postman collections. |
| Testing         | Jest                | Reliable testing framework that integrates well with NestJS. Supports both unit and e2e tests. |

Key Reasons:
1. **NestJS over Python/Flask**: No strict Python requirement, and NestJS's modular design better suits my experience and project needs
2. **Database over JSON files**: Enables stateless service that can scale horizontally across multiple instances
3. **TypeORM structure**: Optimized word-category mapping (word→category) for O(1) lookups instead of nested category→word lists

## Project Structure

```
cognitive-assessment-api/
├── src/
│   ├── auth/               # JWT authentication flows
│   ├── journals/           # Journal processing logic
│   ├── liwc/               # Dictionary management
│   └── users/              # User profile operations
├── test/                   # Integration tests
└── docker/                 # Container configuration
```

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aiabusalama/cognitive-assessment-api.git
   cd cognitive-assessment-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start:dev
   ```

4. Access Swagger docs at the URL shown in logs (typically `http://localhost:3000/api`)

### First-Time Setup

1. **Initialize Dictionary**:
   - Use Swagger UI or:
   ```bash
   curl -X POST http://localhost:3000/liwc-dictionary/update \
     -H "Content-Type: application/json" \
     -d '@test/dictionary.json'
   ```

2. **Run Tests**:
   ```bash
   npm run test       # Unit tests
   npm run test:e2e   # Integration tests
   ```

### Swagger Workflow

1. Register a user via `/auth/register`
2. Login via `/auth/login` to obtain JWT token
3. Click the lock icon in Swagger to add your token
4. Initialize dictionary via `POST /liwc-dictionary/update`
5. Submit journal entries via `POST /journals`

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Obtain JWT token |
| `/journals` | POST | Submit journal entry |
| `/journals` | GET | List user's journals |
| `/journals/{id}/score` | GET | Get analysis scores |
| `/liwc-dictionary` | GET | View current dictionary |
| `/liwc-dictionary/update` | POST | Update dictionary |
| `/users/me` | GET | Get user profile |

## Core Analysis Process

1. **Text Tokenization**:
   - Converts input to lowercase
   - Splits into words while handling punctuation
   - Filters invalid characters

2. **Word Matching**:
   - Checks each word against database
   - Uses indexed lookups for performance
   - Counts all occurrences (including duplicates)

3. **Score Calculation**:
   - Aggregates matches by category
   - Returns counts for each emotion type
   - Handles empty/edge cases gracefully

## Key Architecture Decisions

1. **Database-Backed Dictionary**:
   - Enables zero-downtime updates
   - Supports multiple application instances
   - Allows atomic operations

2. **Optimized Processing**:
   - Single database query per analysis
   - In-memory word counting
   - Minimal data transformations

3. **Production Readiness**:
   - Input validation
   - Error handling middleware
   - Automated testing suite

## Performance Metrics

| Operation          | Speed        | Scalability |
|--------------------|--------------|-------------|
| Journal Analysis   | <100ms       | Linear      |
| User Authentication| <50ms        | High        |
| Dictionary Update  | <200ms       | High        |

## Future Roadmap

- [ ] Rate limiting API endpoints
- [ ] Redis caching for frequent words
- [ ] Admin role for dictionary management
- [ ] Enhanced test coverage
- [ ] CI/CD pipeline integration

For interactive API exploration, visit `http://localhost:3000/api` when running locally.
