import Link from 'next/link';

export const metadata = {
  title: "B2B Travel Portal | Travel Agency",
  description: "Join our network of travel agencies and partners.",
};

export default function B2bPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-[#fcfcfd]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-[#1a1a1a] mb-6">B2B Agent Portal</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          Welcome to our B2B travel portal. We partner with travel agencies to provide the best experiences for your clients. (Coming Soon)
        </p>
        <Link 
          href="/" 
          className="inline-block px-8 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
