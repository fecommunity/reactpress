# @fecommunity/reactpress-server

ReactPress Server - NestJS-based backend API for ReactPress CMS with WordPress-style 5-minute installation.

## Quick Start

### Installation & Setup

```bash
npx @fecommunity/reactpress-server
```

That's it! The command will automatically:

1. **Auto-detect** if configuration exists
2. **Launch installation wizard** in your browser if no configuration found
3. **Start the server** immediately after installation
4. **Open API documentation** at `http://localhost:3002/api`

### Features

- 🚀 **Zero-command installation** - No complex CLI parameters needed
- 🌍 **WordPress-style setup** - Familiar 5-minute installation process
- 🔧 **Auto-configuration** - Generates `.env` files automatically
- 🔌 **Database auto-setup** - Creates MySQL database if it doesn't exist
- 🎯 **Seamless flow** - From installation to running server in minutes
- 📖 **Auto-documentation** - Swagger API docs available immediately

### Requirements

- Node.js >= 16.5.0
- MySQL 5.7+ or 8.0+

### Usage Scenarios

#### Standalone API Server
Perfect for:
- Headless CMS implementation
- Mobile app backend
- Microservices architecture
- Custom frontend integration

#### Full ReactPress Stack
Use with ReactPress client for complete CMS solution:
```bash
# Start server
npx @fecommunity/reactpress-server

# In another terminal, start client
npx @fecommunity/reactpress-client
```

### Configuration

The installation wizard will create a `.env` file with:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_username
DB_PASSWD=your_password
DB_DATABASE=reactpress
CLIENT_SITE_URL=http://localhost:3001
SERVER_SITE_URL=http://localhost:3002
```

### API Documentation

Once running, visit `http://localhost:3002/api` for:
- Interactive Swagger documentation
- API endpoint explorer
- Authentication examples
- Response schemas

### Development

```bash
# Clone repository
git clone https://github.com/fecommunity/reactpress.git
cd reactpress/server

# Install dependencies
npm install

# Start development server
npm run dev
```

### Docker Support

```bash
# Using Docker
docker run -p 3002:3002 @fecommunity/reactpress-server

# Using docker-compose
docker-compose up reactpress-server
```

### Support

- 📖 [Documentation](https://github.com/fecommunity/reactpress)
- 🐛 [Issues](https://github.com/fecommunity/reactpress/issues)
- 💬 [Discussions](https://github.com/fecommunity/reactpress/discussions)

### License

MIT License - see [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [FECommunity](https://github.com/fecommunity)