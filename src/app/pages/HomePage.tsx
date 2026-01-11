import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Presentation, Sparkles, Zap, Shield, Clock } from 'lucide-react';
import { Footer } from '../components/Footer';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <div className="flex-1">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full mb-6">
            <Sparkles className="size-4" />
            <span className="text-sm">AI-Powered Document Processing</span>
          </div>
          <h1 className="text-5xl mb-6">
            Transform Your Documents Into
            <br />
            <span className="text-blue-600">Summaries & Presentations</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your documents and let our AI create concise summaries or professional presentations in seconds.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/summary">
              <Button size="lg" className="gap-2">
                <FileText className="size-5" />
                Start Summarizing
              </Button>
            </Link>
            <Link to="/presentation">
              <Button size="lg" variant="outline" className="gap-2">
                <Presentation className="size-5" />
                Create Presentation
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Zap className="size-10 text-blue-600 mb-4" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Process documents in seconds with our advanced AI algorithms
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="size-10 text-blue-600 mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your documents are processed securely and never shared
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Clock className="size-10 text-blue-600 mb-4" />
              <CardTitle>Document History</CardTitle>
              <CardDescription>
                Access all your processed documents anytime from your profile
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl mb-2">Upload Document</h3>
              <p className="text-gray-600">
                Choose your file and upload it to our platform
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl mb-2">AI Processing</h3>
              <p className="text-gray-600">
                Our AI analyzes and processes your content
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl mb-2">Get Results</h3>
              <p className="text-gray-600">
                Download your summary or presentation instantly
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who save time with DocAI
            </p>
            <Link to="/summary">
              <Button size="lg" variant="secondary">
                Try It Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      </div>
      <Footer />
    </div>
  );
}