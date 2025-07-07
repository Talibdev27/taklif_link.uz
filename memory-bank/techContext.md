# Tech Context - TalkieUZ Technology Stack

## Core Technology Stack

### Frontend Technologies
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.0.3 for fast development and optimized builds
- **Styling**: Tailwind CSS 3.4.17 with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query 5.60.5 for server state
- **Routing**: Wouter 3.3.5 for lightweight client-side routing
- **Forms**: React Hook Form 7.55.0 with Zod validation
- **Internationalization**: react-i18next 15.5.2

### Backend Technologies
- **Runtime**: Node.js with Express.js 4.21.2
- **Language**: TypeScript 5.7.2 for type safety
- **Database**: PostgreSQL with SQLite fallback
- **ORM**: Drizzle ORM 0.39.1 with Drizzle Kit 0.30.0
- **Authentication**: JWT (jsonwebtoken 9.0.2) with bcrypt 6.0.0
- **File Uploads**: Multer 2.0.0 for multipart form handling
- **Security**: Helmet 8.1.0 + Express Rate Limit 7.5.0

### Database Architecture
- **Production**: Neon serverless PostgreSQL with WebSocket support
- **Development**: SQLite 3 with better-sqlite3 12.1.1
- **Connection**: @neondatabase/serverless 0.10.4 with connection pooling
- **Migrations**: Drizzle Kit for schema management and versioning

### Development Tools
- **Package Manager**: npm with package-lock.json
- **Bundler**: esbuild 0.24.2 for production builds
- **Process Manager**: tsx 4.19.2 for TypeScript execution
- **CSS Framework**: Tailwind with PostCSS 8.5.1
- **Type Checking**: TypeScript compiler with strict settings

## Development Setup Requirements

### System Prerequisites
```bash
Node.js >= 18.0.0
npm >= 8.0.0
PostgreSQL >= 13.0 (for production)
Git for version control
```

### Local Development Environment
```bash
# Clone and install
npm install

# Database setup
createdb wedding_planning_db

# Environment configuration
cp .env.example .env
# Edit DATABASE_URL in .env

# Initialize database
npm run db:push

# Start development server
npm run dev
```

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/wedding_db"

# Authentication
JWT_SECRET="your-secret-key"

# Admin Access
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="secure-password"

# Payment Integration (Uzbekistan)
PAYME_MERCHANT_ID="payme_merchant_id"
PAYME_SECRET_KEY="payme_secret"
CLICK_MERCHANT_ID="click_merchant_id"
CLICK_SECRET_KEY="click_secret"

# Deployment
NODE_ENV="production"
PORT=5000
BASE_URL="https://your-domain.com"
```

## Database Configuration

### Development Database (SQLite)
```typescript
// Local development uses file-based SQLite
const storage = new DatabaseStorage(); // wedding.db file
```

### Production Database (PostgreSQL)
```typescript
// Neon serverless PostgreSQL with WebSocket support
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

### Schema Management
```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly (development)
npm run db:push
```

## Security Configuration

### Authentication Flow
```typescript
// JWT token generation
const token = jwt.sign(
  { userId, email, role, isAdmin },
  JWT_SECRET,
  { expiresIn: '7d' }
);
```

### Password Security
```typescript
// bcrypt for password hashing
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### Request Security
```typescript
// Helmet.js security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "wss:", "ws:", "https:"]
    }
  }
}));
```

### Rate Limiting (Production Only)
```typescript
// Authentication endpoints: 10 requests per 15 minutes
// General API: 1000 requests per minute
```

## File Upload Configuration

### Storage Setup
```typescript
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const uniqueSuffix = nanoid();
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
```

## Payment Integration (Uzbekistan)

### Supported Payment Methods
- **Payme**: Uzbekistan's leading payment system
- **Click**: Popular mobile payment platform
- **Paycom**: Additional payment gateway

### Payment Configuration
```typescript
const PAYMENT_CONFIG = {
  payme: {
    merchant_id: process.env.PAYME_MERCHANT_ID,
    secret_key: process.env.PAYME_SECRET_KEY,
    endpoint: 'https://checkout.paycom.uz'
  },
  click: {
    merchant_id: process.env.CLICK_MERCHANT_ID,
    secret_key: process.env.CLICK_SECRET_KEY,
    endpoint: 'https://my.click.uz/services/pay'
  }
};
```

## Deployment Architecture

### Production Deployment (Render)
```bash
# Build process
npm run build
# Outputs: dist/ (server) + client/dist (frontend)

# Start command
npm start
# Runs: node dist/index.js
```

### Static Asset Serving
```typescript
// Development: Vite dev server
// Production: Express static middleware
app.use('/uploads', express.static('uploads'));
```

### WebSocket Support
```typescript
const wss = new WebSocketServer({ 
  server: httpServer, 
  path: '/ws' 
});

// Real-time updates for wedding changes
wss.on('connection', (ws) => {
  // Handle wedding room subscriptions
  // Broadcast RSVP updates, guest changes
});
```

## Internationalization Setup

### Language Resource Structure
```
client/src/locales/
├── en/translation.json (English)
├── ru/translation.json (Russian)
└── uz/translation.json (Uzbek)
```

### i18n Configuration
```typescript
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru', 'uz'],
    backend: {
      loadPath: '/src/locales/{{lng}}/{{ns}}.json'
    }
  });
```

## Performance Optimization

### Frontend Optimizations
- **Code Splitting**: React.lazy() for route components
- **Bundle Analysis**: Vite rollup analyzer
- **Image Optimization**: WebP format support
- **Caching**: TanStack Query with stale-while-revalidate

### Backend Optimizations
- **Database Indexing**: Primary keys, foreign keys, unique constraints
- **Connection Pooling**: PostgreSQL connection management
- **Query Optimization**: Selective field loading
- **Static Asset Caching**: Express.js static file serving

## Development Constraints

### Technical Limitations
- **File Storage**: Filesystem-based (no S3/CDN integration yet)
- **Database**: No automatic backups configured
- **Monitoring**: Basic console logging only
- **Testing**: No automated test suite implemented

### Scalability Considerations
- **Database**: PostgreSQL can handle current load but needs optimization for scale
- **File Storage**: Local filesystem limits horizontal scaling
- **Session Management**: In-memory storage doesn't scale across instances
- **Real-time Features**: WebSocket connections limited by single server instance

### Security Gaps
- **Input Validation**: Client-side validation only for some endpoints
- **Rate Limiting**: Not applied to all endpoints
- **File Upload**: No virus scanning or advanced validation
- **HTTPS**: Handled by hosting platform, not enforced in code

## Troubleshooting Common Issues

### Database Connection Issues
```bash
# Check PostgreSQL connection
psql "postgresql://user:pass@host:port/db"

# Fallback to SQLite in development
rm wedding.db && npm run db:push
```

### Build Issues
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Permission Issues
```bash
# Fix upload directory permissions
chmod 755 uploads/
chown -R $USER:$USER uploads/
``` 