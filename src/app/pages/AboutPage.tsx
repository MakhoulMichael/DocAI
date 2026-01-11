import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Target, Users, Zap } from 'lucide-react';
import { Footer } from '../components/Footer';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <FileText className="size-12 text-blue-600" />
            </div>
            <h1 className="text-4xl mb-4">About DocAI</h1>
            <p className="text-xl text-gray-600">
              Empowering professionals with AI-powered document processing
            </p>
          </div>

          <div className="mb-12">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl mb-4">Our Mission</h2>
                <p className="text-gray-700 mb-4">
                  DocAI was created to solve a common problem faced by professionals worldwide: the time-consuming task of processing large documents and creating presentations. We believe that artificial intelligence should be accessible and practical, helping people work smarter, not harder.
                </p>
                <p className="text-gray-700">
                  Our platform leverages cutting-edge AI technology to analyze documents, extract key information, and generate professional outputs in seconds. Whether you're a student, researcher, business professional, or content creator, DocAI helps you save valuable time and focus on what matters most.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Target className="size-10 text-blue-600 mb-4" />
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  To become the leading AI-powered platform for document processing, making professional-grade content creation accessible to everyone.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="size-10 text-blue-600 mb-4" />
                <CardTitle>Our Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  We use state-of-the-art natural language processing and machine learning algorithms to understand, analyze, and transform your documents.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="mb-2">📄 Smart Summarization</h3>
                  <p className="text-sm text-gray-700">
                    Our AI analyzes your documents and creates concise, accurate summaries that capture the essential information.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2">🎯 Presentation Generation</h3>
                  <p className="text-sm text-gray-700">
                    Transform long documents into structured, professional presentations with customizable themes and layouts.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2">🔒 Secure Processing</h3>
                  <p className="text-sm text-gray-700">
                    Your documents are processed securely and privately. We never share your data with third parties.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2">📊 Document History</h3>
                  <p className="text-sm text-gray-700">
                    Access all your processed documents anytime from your personal profile dashboard.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2">⚡ Lightning Fast</h3>
                  <p className="text-sm text-gray-700">
                    Get results in seconds, not hours. Our optimized AI processes documents at incredible speeds.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2">🎨 Customizable Output</h3>
                  <p className="text-sm text-gray-700">
                    Choose from multiple themes, formats, and styles to match your specific needs and preferences.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="size-10 text-blue-600 mb-4" />
              <CardTitle>Who We Serve</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700">
                    <strong>Students & Researchers:</strong> Quickly summarize academic papers, research documents, and study materials
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700">
                    <strong>Business Professionals:</strong> Create presentations from reports, proposals, and meeting notes
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700">
                    <strong>Content Creators:</strong> Transform long-form content into digestible summaries and slide decks
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700">
                    <strong>Educators:</strong> Develop teaching materials and student presentations from educational content
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="mt-12 text-center">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-8">
                <h2 className="text-2xl mb-4">Get Started Today</h2>
                <p className="text-gray-700">
                  Join thousands of users who are already saving time and working more efficiently with DocAI.
                  Sign up now and experience the power of AI-driven document processing!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}