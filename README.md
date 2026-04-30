# Portfolio Website

A modern, responsive portfolio website with an integrated admin portal for managing your content. Built with Next.js 16, SQLite, and modern web technologies.

## Features

### Public Website
- **Modern Design**: Clean, minimalist design with smooth animations
- **Responsive**: Mobile-first approach, works perfectly on all devices
- **Sections**: Hero section, Projects, Experience, Skills, Blog, and Contact
- **SEO Optimized**: Proper metadata and semantic HTML

### Admin Portal
- **Protected Routes**: Secure login with session management
- **Content Management**:
  - Projects: Add, edit, delete portfolio projects
  - Experience: Manage work history
  - Skills: Track technical skills and proficiency
  - Blog: Write and publish articles
  - Profile: Update personal information
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Changes reflect immediately on the website

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: SQLite (sql.js)
- **Validation**: Zod
- **Authentication**: Custom session-based auth with bcryptjs
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm, npm, or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Default Admin Credentials

```
Email: admin@portfolio.local
Password: admin123
```

**⚠️ IMPORTANT**: Change these credentials immediately after first login in production!

## Project Structure

```
portfolio/
├── app/
│   ├── admin/                 # Admin portal
│   │   ├── login/            # Login page
│   │   ├── dashboard/        # Main dashboard
│   │   ├── projects/         # Project management
│   │   ├── experience/       # Experience management
│   │   ├── skills/           # Skills management
│   │   ├── blog/             # Blog management
│   │   ├── profile/          # Profile management
│   │   └── layout.tsx        # Admin layout
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── projects/         # Projects API
│   │   ├── experience/       # Experience API
│   │   ├── skills/           # Skills API
│   │   ├── blog/             # Blog API
│   │   └── profile/          # Profile API
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── header.tsx            # Navigation header
│   ├── footer.tsx            # Footer
│   └── error-alert.tsx       # Error/success alerts
├── lib/
│   ├── db.ts                 # Database utilities
│   ├── auth.ts               # Authentication helpers
│   └── validations.ts        # Zod validation schemas
└── public/                   # Static assets
```

## Usage

### Adding Content

1. Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Login with default credentials (change after first login!)
3. Navigate to the section you want to manage (Projects, Experience, etc.)
4. Use the forms to add, edit, or delete content
5. Changes appear immediately on the public website

### Customization

#### Colors & Styling
Edit `app/globals.css` to customize the color scheme:
```css
:root {
  --primary: oklch(...);
  --foreground: oklch(...);
  /* other variables */
}
```

#### Content Sections
Modify sections in `app/page.tsx` to change the public homepage layout.

#### Database Schema
The database schema is defined in `lib/db.ts`. Modify the `createTables()` function to change table structure.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Content
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/experience` - Get all experience
- `POST /api/experience` - Add experience
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Add skill
- `GET /api/blog` - Get blog posts
- `POST /api/blog` - Create blog post
- `GET /api/profile` - Get profile
- `POST /api/profile` - Update profile

## Database

The application uses SQLite with sql.js for data persistence. The database file is stored in `portfolio.db` at the project root.

### Backup
Regular backups are recommended for production use. The `portfolio.db` file can be backed up directly.

## Security Considerations

⚠️ **Important for Production:**

1. **Change Default Credentials**: Immediately update the default admin password
2. **Enable HTTPS**: Use HTTPS in production (required for secure cookies)
3. **Environment Variables**: Use proper environment variables for sensitive data
4. **Database**: Consider using a proper database service (PostgreSQL, MongoDB) for production
5. **Authentication**: Implement proper JWT or session management for production scale
6. **Rate Limiting**: Add rate limiting to prevent abuse
7. **Input Validation**: All forms are validated with Zod, but ensure backend validation

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

```bash
# Or deploy with Vercel CLI
vercel deploy
```

### Other Platforms
The application is compatible with any Node.js hosting platform (Heroku, DigitalOcean, AWS, etc.)

### Environment Variables
Create a `.env.local` file:
```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Troubleshooting

### Database Issues
- Check if `portfolio.db` file exists in the project root
- Clear browser cache and cookies if experiencing session issues

### Login Not Working
- Ensure default credentials haven't been changed
- Check browser console for errors
- Verify cookies are enabled

### Styling Issues
- Run `pnpm dev` to rebuild Tailwind CSS
- Clear `.next` folder if changes don't appear

## Performance Tips

1. Optimize project images (use WebP format)
2. Enable caching headers on static assets
3. Use CDN for image delivery
4. Minify CSS and JavaScript (Next.js does this automatically)
5. Monitor Core Web Vitals

## Contributing

To contribute improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial use.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the code comments
3. Open an issue on GitHub

## Future Enhancements

- [ ] Email notifications
- [ ] Image upload to cloud storage
- [ ] Advanced analytics
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Comment system for blog
- [ ] Search functionality

---

Made with ❤️ for web developers
