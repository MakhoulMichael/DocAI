import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useDocuments } from '../contexts/DocumentContext';
import { FileText, Presentation, Calendar, LogOut, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import pptxgen from 'pptxgenjs';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { documents, getDocumentsByType } = useDocuments();
  const navigate = useNavigate();

  const summaries = getDocumentsByType('summary');
  const presentations = getDocumentsByType('presentation');

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const downloadDocument = (doc: any) => {
    if (doc.type === 'summary') {
      const docx = new DocxDocument({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: doc.name,
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: doc.content,
                    size: 16,
                  }),
                ],
              }),
            ],
          },
        ],
      });

      Packer.toBlob(docx).then((blob) => {
        saveAs(blob, `${doc.name}.docx`);
      });
    } else if (doc.type === 'presentation') {
      const pptx = new pptxgen();
      const slide = pptx.addSlide();
      slide.addText(doc.name, { x: 1, y: 1, fontSize: 24, bold: true });
      slide.addText(doc.content, { x: 1, y: 2, fontSize: 16 });

      pptx.save('blob').then((blob) => {
        saveAs(blob, `${doc.name}.pptx`);
      });
    } else {
      toast.error('Unsupported document type');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl mb-2">Profile</h1>
              <p className="text-gray-600">Manage your account and view your document history</p>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">January 2026</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Summaries</span>
                  </div>
                  <span className="text-2xl">{summaries.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Presentation className="size-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Presentations</span>
                  </div>
                  <span className="text-2xl">{presentations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Total Documents</span>
                  </div>
                  <span className="text-2xl">{documents.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Used</span>
                    <span className="font-medium">{documents.length * 2.5} MB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((documents.length * 2.5 / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">100 MB available</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Document History</CardTitle>
              <CardDescription>View and manage all your processed documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All ({documents.length})</TabsTrigger>
                  <TabsTrigger value="summaries">Summaries ({summaries.length})</TabsTrigger>
                  <TabsTrigger value="presentations">Presentations ({presentations.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  {documents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="size-12 mx-auto mb-4 opacity-50" />
                      <p>No documents yet. Start by creating a summary or presentation!</p>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {doc.type === 'summary' ? (
                              <FileText className="size-5 text-blue-600 mt-1" />
                            ) : (
                              <Presentation className="size-5 text-blue-600 mt-1" />
                            )}
                            <div className="flex-1">
                              <h3 className="mb-1">{doc.name}</h3>
                              <p className="text-sm text-gray-500 mb-2">{formatDate(doc.createdAt)}</p>
                              <Badge variant="outline">
                                {doc.type === 'summary' ? 'Summary' : 'Presentation'}
                              </Badge>
                            </div>
                          </div>
                          <Button variant="outline" onClick={() => downloadDocument(doc)}>
                            <Download className="size-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="summaries" className="space-y-4">
                  {summaries.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="size-12 mx-auto mb-4 opacity-50" />
                      <p>No summaries yet. Create your first summary!</p>
                    </div>
                  ) : (
                    summaries.map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <FileText className="size-5 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <h3 className="mb-1">{doc.name}</h3>
                            <p className="text-sm text-gray-500">{formatDate(doc.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="presentations" className="space-y-4">
                  {presentations.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Presentation className="size-12 mx-auto mb-4 opacity-50" />
                      <p>No presentations yet. Create your first presentation!</p>
                    </div>
                  ) : (
                    presentations.map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <Presentation className="size-5 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <h3 className="mb-1">{doc.name}</h3>
                            <p className="text-sm text-gray-500">{formatDate(doc.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}