import { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Upload, FileText, Loader2, Download, BookOpen, Sparkles } from 'lucide-react';
import { useDocuments } from '../contexts/DocumentContext';
import { toast } from 'sonner';
import { Footer } from '../components/Footer';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

export function SummaryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 });
  const summaryRef = useRef<HTMLDivElement>(null);
  const { addDocument } = useDocuments();

  // Preferences state
  const [summaryFormat, setSummaryFormat] = useState('bullet');
  const [summaryType, setSummaryType] = useState('general');
  const [summaryTone, setSummaryTone] = useState('neutral');
  const [summaryLanguage, setSummaryLanguage] = useState('english');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [customWordCount, setCustomWordCount] = useState('');

  useEffect(() => {
    const handleClickOutside = () => {
      setShowActions(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTextContent('');
    }
  };

  const handleTextSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 0) {
      setSelectedText(text);
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      if (rect) {
        setActionPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
        setShowActions(true);
      }
    } else {
      setShowActions(false);
    }
  };

  const handleGetSynonym = () => {
    if (!selectedText) return;
    
    // Mock synonym generation
    const synonyms: { [key: string]: string } = {
      'analyzed': 'examined',
      'important': 'crucial',
      'provides': 'offers',
      'demonstrates': 'illustrates',
      'comprehensive': 'thorough',
      'essential': 'vital',
      'significant': 'substantial',
    };
    
    const words = selectedText.toLowerCase().split(' ');
    const newText = words.map(word => synonyms[word] || word).join(' ');
    
    if (summaryRef.current) {
      const currentText = summaryRef.current.innerText;
      const updatedText = currentText.replace(selectedText, newText);
      summaryRef.current.innerText = updatedText;
      setSummary(updatedText);
    }
    
    setShowActions(false);
    toast.success('Synonym applied!');
  };

  const handleDevelop = () => {
    if (!selectedText) return;
    
    // Mock text expansion
    const expanded = `${selectedText}, which further illustrates the key points and provides additional context to enhance understanding`;
    
    if (summaryRef.current) {
      const currentText = summaryRef.current.innerText;
      const updatedText = currentText.replace(selectedText, expanded);
      summaryRef.current.innerText = updatedText;
      setSummary(updatedText);
    }
    
    setShowActions(false);
    toast.success('Text developed!');
  };

  const handleSummarize = async () => {
    if (!file && !textContent) {
      toast.error('Please upload a file or enter text');
      return;
    }

    setIsProcessing(true);
    
    // Simulate AI processing with preferences
    setTimeout(() => {
      const formatText = summaryFormat === 'bullet' ? 'bullet points' : 'paragraph';
      const lengthText = summaryLength === 'custom' ? `${customWordCount} words` : summaryLength;
      
      let mockSummary = `Summary of "${file?.name || 'your text'}" (${formatText}, ${summaryType} style, ${summaryTone} tone, ${summaryLanguage}, ${lengthText} length):\n\n`;
      
      if (summaryFormat === 'bullet') {
        mockSummary += `• Main topic identified and analyzed based on ${summaryType} approach\n• Content processed with ${summaryTone} tone in ${summaryLanguage}\n• Supporting arguments and evidence summarized\n• Key conclusions and recommendations highlighted\n• Action items extracted (if applicable)\n\nThe summary condenses the original content while preserving essential information and context.`;
      } else {
        mockSummary += `This ${summaryType} summary has been generated with a ${summaryTone} tone in ${summaryLanguage}. The AI has analyzed the content and extracted the main topics, supporting arguments, and key conclusions. All essential information has been preserved while condensing the original content to approximately ${lengthText} in length. The summary maintains context and provides a comprehensive overview of the document's core message and important details.`;
      }
      
      setSummary(mockSummary);
      
      addDocument({
        name: file?.name || 'Text Summary',
        type: 'summary',
        content: textContent || file?.name || '',
        result: mockSummary,
      });
      
      setIsProcessing(false);
      toast.success('Summary generated successfully!');
    }, 2000);
  };

  const handleDownload = () => {
    const finalSummary = summaryRef.current?.innerText || summary;
    const blob = new Blob([finalSummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name || 'summary'}_summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded!');
  };

  const handleDownloadDocx = () => {
    const finalSummary = summaryRef.current?.innerText || summary;
    const doc = new DocxDocument({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: finalSummary,
                  break: 1,
                }),
              ],
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `${file?.name || 'summary'}_summary.docx`);
      toast.success('Summary downloaded as DOCX!');
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Summarize Documents</h1>
            <p className="text-gray-600">Upload a document or paste text to get an AI-generated summary</p>
          </div>

          <div className="space-y-6">
            {/* Upload Document Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>Choose a file or paste your text below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="file-upload">Upload File</Label>
                  <div className="mt-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                        <Upload className="size-10 mx-auto mb-4 text-gray-400" />
                        {file ? (
                          <div className="flex items-center justify-center gap-2 text-blue-600">
                            <FileText className="size-5" />
                            <span>{file.name}</span>
                          </div>
                        ) : (
                          <>
                            <p className="mb-2">Click to upload or drag and drop</p>
                            <p className="text-sm text-gray-500">PDF, DOCX, TXT (Max 10MB)</p>
                          </>
                        )}
                      </div>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="text-content">Paste Text</Label>
                  <Textarea
                    id="text-content"
                    placeholder="Paste your text here..."
                    rows={6}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {/* Preferences Section */}
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Summary Preferences</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="summary-format">Summary Format</Label>
                      <Select value={summaryFormat} onValueChange={setSummaryFormat}>
                        <SelectTrigger id="summary-format" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bullet">Bullet Points</SelectItem>
                          <SelectItem value="paragraph">Paragraph</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="summary-type">Summary Type</Label>
                      <Select value={summaryType} onValueChange={setSummaryType}>
                        <SelectTrigger id="summary-type" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="academic">Academic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="summary-tone">Summary Tone</Label>
                      <Select value={summaryTone} onValueChange={setSummaryTone}>
                        <SelectTrigger id="summary-tone" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="summary-language">Summary Language</Label>
                      <Select value={summaryLanguage} onValueChange={setSummaryLanguage}>
                        <SelectTrigger id="summary-language" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="summary-length">Summary Length</Label>
                      <Select value={summaryLength} onValueChange={setSummaryLength}>
                        <SelectTrigger id="summary-length" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {summaryLength === 'custom' && (
                      <div>
                        <Label htmlFor="custom-word-count">Number of Words</Label>
                        <Input
                          id="custom-word-count"
                          type="number"
                          placeholder="e.g., 150"
                          value={customWordCount}
                          onChange={(e) => setCustomWordCount(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleSummarize} 
                  className="w-full" 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText className="size-4 mr-2" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Summary Result Section */}
            {summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Summary Result</CardTitle>
                  <CardDescription>Edit your summary and select text to get synonyms or develop phrases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div 
                      ref={summaryRef}
                      contentEditable
                      suppressContentEditableWarning
                      onMouseUp={handleTextSelection}
                      className="bg-white rounded-lg p-6 border min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {summary}
                    </div>
                    
                    {showActions && (
                      <div
                        className="fixed bg-white shadow-lg rounded-lg border p-2 flex gap-2 z-50"
                        style={{
                          left: `${actionPosition.x}px`,
                          top: `${actionPosition.y}px`,
                          transform: 'translate(-50%, -100%)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleGetSynonym}
                          className="gap-2"
                        >
                          <BookOpen className="size-4" />
                          Get Synonym
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDevelop}
                          className="gap-2"
                        >
                          <Sparkles className="size-4" />
                          Develop
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button onClick={handleDownload} className="w-full">
                        <Download className="size-4 mr-2" />
                        Download Summary
                      </Button>
                      <Button onClick={handleDownloadDocx} className="w-full">
                        <Download className="size-4 mr-2" />
                        Download as DOCX
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}