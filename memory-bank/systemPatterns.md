# System Patterns - TalkieUZ Architecture

## Core Architecture Patterns

### Multi-Tenant SaaS Pattern
- **Shared Infrastructure**: Single codebase serves multiple wedding websites
- **Data Isolation**: Strict separation between wedding data using userId filtering
- **URL Routing**: Individual wedding sites accessible via `/wedding/{uniqueUrl}`
- **Resource Sharing**: Common templates, UI components, and authentication system

### Role-Based Access Control (RBAC)
```
Admin (isAdmin: true, role: 'admin')
├── Full system access
├── User management
├── All wedding management
└── System administration

User (role: 'user')
├── Own wedding creation/management
├── Guest management for owned weddings
├── Photo gallery management
└── Payment/subscription management

Guest Manager (role: 'guest_manager')
├── Assigned wedding guest management only
├── RSVP tracking and analytics
├── Limited wedding access
└── No wedding creation rights
```

### Authentication & Authorization Flow
```
Request → JWT Token Check → Role Verification → Ownership Check → Route Access
```

**Middleware Stack**:
1. `authenticateToken`: Verifies JWT validity
2. `verifyWeddingOwnership`: Ensures user owns wedding or is admin
3. `requireAdmin`: Restricts admin-only endpoints

## Database Architecture Patterns

### Core Entity Relationships
```
Users (1:N) Weddings
Weddings (1:N) Guests
Weddings (1:N) Photos
Weddings (1:N) GuestBookEntries
Weddings (1:N) GuestCollaborators
Users (N:M) Weddings (via WeddingAccess)
```

### Data Persistence Strategy
- **Production**: PostgreSQL via Neon serverless with connection pooling
- **Development**: SQLite with file storage (wedding.db)
- **Migration**: Drizzle ORM with TypeScript-first schema
- **Fallback Logic**: Production falls back to SQLite if PostgreSQL unavailable

### Storage Patterns
- **Wedding Data**: Normalized relational structure
- **File Uploads**: Filesystem storage in `/uploads` directory
- **Session Management**: JWT tokens with 7-day expiry
- **Configuration**: JSON fields for complex data (permissions, coordinates)

## Frontend Architecture Patterns

### Component Architecture
```
App.tsx (Root)
├── Router (wouter)
├── AuthProvider (Context)
├── QueryClientProvider (TanStack Query)
├── I18nextProvider (Internationalization)
└── TooltipProvider (UI Framework)
```

### State Management Strategy
- **Server State**: TanStack Query for API data caching
- **Authentication State**: React Context with localStorage persistence
- **Form State**: React Hook Form with Zod validation
- **UI State**: Local component state with React hooks

### Protected Route Pattern
```tsx
<ProtectedRoute allowedRoles={['user', 'admin']}>
  <Component />
</ProtectedRoute>
```

**Security Enforcement**:
- Client-side route protection for UX
- Server-side authorization for security
- Role-based component rendering

## Template System Architecture

### Template Hierarchy
```
Base Template Interface
├── Standard Template (customizable backgrounds)
├── Premium Templates (fixed designs)
│   ├── Garden Romance
│   ├── Modern Elegance
│   ├── Rustic Charm
│   ├── Beach Bliss
│   ├── Classic Tradition
│   └── Boho Chic
└── Epic Template (special handling)
```

### Template Configuration Pattern
```typescript
const templateConfigs = {
  [templateName]: {
    heroImage: string,
    bgGradient: string,
    primaryColor: string,
    accentColor: string,
    textColor: string,
    cardBg: string,
    overlayBg: string
  }
}
```

### Customization Levels
- **Standard**: Full customization (background, colors, content)
- **Premium**: Color customization only
- **Epic**: Special component with unique layout

## API Design Patterns

### RESTful Resource Organization
```
/api/auth/*          - Authentication endpoints
/api/user/*          - User-specific resources
/api/admin/*         - Admin-only resources
/api/guest-manager/* - Guest manager restricted resources
/api/weddings/*      - Wedding resources with ownership verification
/api/photos/*        - Photo upload and management
/api/guests/*        - Guest management
```

### Security Middleware Stack
```
Rate Limiting → CORS → Helmet Security → JWT Auth → Role Check → Ownership Verification
```

### Error Handling Pattern
- **Consistent HTTP Status Codes**: 401, 403, 404, 500
- **Structured Error Responses**: `{ message: string, error?: string }`
- **Client-side Error Boundaries**: Toast notifications for user feedback

## Real-time Communication

### WebSocket Architecture
```
HTTP Server → WebSocket Server → Wedding Rooms → Client Connections
```

**Use Cases**:
- Real-time RSVP updates
- Guest list changes
- Photo uploads notifications
- Collaboration activity

## Internationalization Patterns

### Language Support Structure
```
/locales/
├── en/translation.json (English)
├── ru/translation.json (Russian)
└── uz/translation.json (Uzbek)
```

### Content Localization Strategy
- **UI Elements**: react-i18next with namespace organization
- **Database Content**: User-generated content in chosen language
- **Template Names**: Localized template descriptions
- **Error Messages**: Translated error states

## File Upload & Media Management

### Upload Flow Pattern
```
Client → Multer Middleware → File Validation → Storage → Database Record → URL Response
```

**Security Measures**:
- File type validation (images only)
- Size limits (5MB per file)
- Unique filename generation
- Path sanitization

## Performance Optimization Patterns

### Frontend Optimizations
- **Code Splitting**: Route-based component loading
- **Image Optimization**: Responsive images with proper sizing
- **Caching Strategy**: TanStack Query for API response caching
- **Bundle Optimization**: Vite for fast development and optimized builds

### Backend Optimizations
- **Database Indexing**: Primary keys and foreign key constraints
- **Query Optimization**: Targeted queries with minimal data fetching
- **Connection Pooling**: PostgreSQL connection management
- **Static Asset Serving**: Express static middleware for uploads

## Development & Deployment Patterns

### Development Workflow
```
Local Development (SQLite) → Git Push → Render Deployment (PostgreSQL)
```

### Environment Configuration
- **Development**: SQLite + localhost:5000
- **Production**: PostgreSQL + Render hosting
- **Configuration**: Environment variables for secrets and database URLs

### Migration Strategy
- **Schema Changes**: Drizzle migrations with version control
- **Data Migration**: Separate scripts for data transformation
- **Rollback Support**: Database snapshots and backup procedures 