# Deployment Guide

This guide covers deploying your portfolio website to production.

## Pre-deployment Checklist

- [ ] Change default admin credentials
- [ ] Update portfolio content
- [ ] Test all features on local machine
- [ ] Review security settings
- [ ] Update metadata in `layout.tsx`
- [ ] Optimize images
- [ ] Test on multiple browsers
- [ ] Check mobile responsiveness

## Deploying to Vercel (Recommended)

Vercel is the best choice for Next.js applications.

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/portfolio.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

### Step 3: Environment Variables

In Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add any required variables

### Step 4: Custom Domain

1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS setup instructions

## Deploying to Other Platforms

### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set buildpack
heroku buildpacks:set heroku/nodejs

# Deploy
git push heroku main
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Select `main` branch
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Deploy!

### AWS Amplify

```bash
npm install -g @aws-amplify/cli

amplify init
amplify add hosting
amplify publish
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

Build and run:
```bash
docker build -t portfolio .
docker run -p 3000:3000 portfolio
```

## Production Database Setup

⚠️ **Important**: SQLite is suitable for development and small projects, but for production consider using a proper database service:

### Option 1: PostgreSQL on Railway

1. Create account on [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Update database connection in `lib/db.ts`
4. Deploy your app

### Option 2: MongoDB Atlas

1. Create account on [mongodb.com/cloud](https://www.mongodb.com/cloud)
2. Create cluster
3. Get connection string
4. Update your code to use MongoDB

### Option 3: Keep SQLite (for small projects)

If using SQLite in production:
- Ensure proper backups
- Monitor database size
- Consider read replicas for scaling

## Post-deployment Checklist

- [ ] Test login functionality
- [ ] Verify all content displays correctly
- [ ] Check links and navigation
- [ ] Test contact form (if added)
- [ ] Monitor performance
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enable monitoring/analytics
- [ ] Backup database regularly

## SSL/HTTPS

- Vercel: Automatically configured with free SSL
- Other platforms: Use Let's Encrypt for free SSL
- AWS: Use ACM certificates
- Heroku: Included with paid dynos

## Performance Optimization

### Image Optimization
- Use `next/image` for automatic optimization
- Convert images to WebP format
- Implement lazy loading

### Caching Strategy
```typescript
// In Next.js config
export const revalidate = 3600; // Revalidate every hour
```

### CDN Setup
- Vercel: Built-in edge caching
- Cloudflare: Free CDN with Vercel
- AWS CloudFront: For other hosting

## Monitoring & Analytics

### Recommended Services

**Error Tracking**
- Sentry (sentry.io)
- LogRocket

**Analytics**
- Vercel Analytics
- Google Analytics
- Plausible

**Performance Monitoring**
- New Relic
- DataDog
- Grafana

## Scaling Considerations

As your portfolio grows:

1. **Database**: Migrate to PostgreSQL or MongoDB
2. **Storage**: Use cloud storage for images (AWS S3, Vercel Blob)
3. **Caching**: Implement Redis for session management
4. **CDN**: Use global CDN for static assets
5. **Monitoring**: Set up comprehensive monitoring

## Backup & Recovery

### Regular Backups

```bash
# Backup SQLite database
cp portfolio.db portfolio.db.backup

# Or use automated backups
# Most cloud providers offer automated backups
```

### Recovery Procedure

1. Stop the application
2. Restore from backup
3. Verify data integrity
4. Restart application

## Troubleshooting Deployment

### Common Issues

**"Build failed"**
- Check Node version compatibility
- Ensure all dependencies are in package.json
- Check build logs for errors

**"Cannot find module"**
- Run `pnpm install` locally
- Ensure pnpm-lock.yaml is committed
- Clear node_modules and reinstall

**"Database connection error"**
- Verify environment variables
- Check database credentials
- Ensure database is accessible from deployment server

**"Timeout errors"**
- Increase timeout settings
- Optimize database queries
- Add caching layer

## Security Hardening

### Essential for Production

1. **Change Default Credentials**
   - Update admin email/password
   - Generate strong passwords

2. **Enable HTTPS**
   - Required by default on Vercel
   - Set `secure: true` in cookies

3. **Rate Limiting**
   - Add rate limiting middleware
   - Prevent brute force attacks

4. **Input Validation**
   - Validate all form inputs
   - Use Zod schemas (already implemented)

5. **CSRF Protection**
   - Implement CSRF tokens
   - Validate origins

6. **Headers Security**
   - Set security headers
   - Implement CSP

```typescript
// Add to next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};
```

## Maintenance

### Regular Tasks

- Monitor error logs
- Review analytics
- Update dependencies monthly
- Test backups quarterly
- Review security patches
- Monitor performance metrics

### Automated Tasks

Set up cron jobs for:
- Database backups
- Log rotation
- Cache clearing
- Health checks

## Support & Help

- Check logs first
- Review error messages carefully
- Search documentation
- Ask community for help
- Contact hosting support

---

Happy deploying! 🚀
