import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">About How You See</h1>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
          {/* Project Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">The Project</h2>
            <p className="text-gray-600 leading-relaxed">
              &quot;How You See&quot; follows the viral Instagram trend of creating personalized collages to show how you see others. 
              This application simplifies the process, allowing you to easily create and share beautiful 3x3 grid collages that represent 
              your unique perspective of someone special.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Features</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Choose between &quot;How You See Him&quot; or &quot;How You See Her&quot;</li>
              <li>Upload images for 9 unique categories (Animal, Place, Plant, etc.)</li>
              <li>Real-time image preview and easy replacement</li>
              <li>Instant collage generation with category labels</li>
              <li>Mobile-optimized upload experience</li>
              <li>Automatic cleanup after download</li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Built With</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Next.js 14 with App Router and Server Components</li>
              <li>TypeScript (93.3%) for type-safe development</li>
              <li>Tailwind CSS for responsive styling</li>
              <li>UploadThing for secure image handling</li>
              <li>Canvas API for high-quality collage generation</li>
            </ul>
          </div>

          {/* Creator Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Creator</h2>
            <div className="flex items-center gap-4">
              <Image 
                src="https://avatars.githubusercontent.com/Parv-gugnani" 
                alt="Parv Gugnani" 
                width={64}
                height={64}
                className="w-16 h-16 rounded-full border-2 border-gray-200"
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Parv Gugnani</h3>
                <p className="text-gray-600">Full Stack Developer</p>
                <a 
                  href="https://github.com/Parv-gugnani/How-we-see-each-other" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:text-blue-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span>View Project on GitHub</span>
                </a>
              </div>
            </div>
          </div>

          {/* Open Source */}
          <div className="pt-6 mt-6 border-t border-gray-100">
            <p className="text-center text-gray-500 text-sm">
              This project is open source and inspired by the viral Instagram trend. 
              Feel free to contribute or use it to create your own special memories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
