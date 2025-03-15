# How You See

A modern web application that lets you create personalized 3x3 grid collages to show how you see someone special, inspired by the viral social media trend.

![Sample Collage](/public/sample.png)

## Features

- Choose between "How You See Him" or "How You See Her"
- Create 3x3 grid collages with 9 unique categories
- Mobile-optimized upload experience
- Instant collage generation with category labels
- Automatic cleanup after download

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- UploadThing
- Canvas API

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/how-you-see.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using the app.

## Contributing

Contributions are welcome! Here's how you can help:

### Development Process

1. Fork the repository
2. Create your feature branch:
```bash
git checkout -b feature/your-feature-name
```
3. Make your changes and test them
4. Commit your changes:
```bash
git commit -m 'Add some feature'
```
5. Push to your branch:
```bash
git push origin feature/your-feature-name
```
6. Create a Pull Request

### Guidelines

- Follow the existing code style and formatting
- Write meaningful commit messages
- Update documentation for any new features
- Add tests if applicable
- Ensure your code passes all tests

### Development Setup

Required environment variables:
```env
UPLOADTHING_SECRET=your_secret_here
UPLOADTHING_APP_ID=your_app_id_here
```

### Areas for Contribution

- UI/UX improvements
- New features
- Bug fixes
- Performance optimizations
- Documentation improvements
- Test coverage

For major changes, please open an issue first to discuss what you would like to change.