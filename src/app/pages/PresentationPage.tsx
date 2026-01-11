import { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Upload, FileText, Loader2, Presentation as PresentationIcon, Download, Check, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { useDocuments } from '../contexts/DocumentContext';
import { toast } from 'sonner';
import { Footer } from '../components/Footer';
import pptxgen from 'pptxgenjs';

const TEMPLATES = [
  { id: 'professional', name: 'Professional', color: 'bg-blue-600', description: 'Clean and corporate' },
  { id: 'modern', name: 'Modern', color: 'bg-purple-600', description: 'Contemporary design' },
  { id: 'minimal', name: 'Minimal', color: 'bg-gray-600', description: 'Simple and elegant' },
  { id: 'creative', name: 'Creative', color: 'bg-orange-600', description: 'Bold and vibrant' },
  { id: 'academic', name: 'Academic', color: 'bg-green-600', description: 'Scholarly style' },
];

interface Slide {
  number: number;
  title: string;
  content: string | string[];
}

export function PresentationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [slideCount, setSlideCount] = useState('5');
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [structure, setStructure] = useState('bullet');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 });
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const slideRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const { addDocument } = useDocuments();

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
    }
  };

  const handleTextSelection = (e: React.MouseEvent, slideIndex: number) => {
    e.stopPropagation();
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 0) {
      setSelectedText(text);
      setEditingSlideIndex(slideIndex);
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
    if (!selectedText || editingSlideIndex === null) return;
    
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
    
    const slideRef = slideRefs.current[editingSlideIndex];
    if (slideRef) {
      const currentText = slideRef.innerText;
      const updatedText = currentText.replace(selectedText, newText);
      slideRef.innerText = updatedText;
      
      // Update slides state
      const updatedSlides = [...slides];
      updatedSlides[editingSlideIndex].content = updatedText;
      setSlides(updatedSlides);
    }
    
    setShowActions(false);
    toast.success('Synonym applied!');
  };

  const handleDevelop = () => {
    if (!selectedText || editingSlideIndex === null) return;
    
    const expanded = `${selectedText}, which further illustrates the key points and provides additional context to enhance understanding`;
    
    const slideRef = slideRefs.current[editingSlideIndex];
    if (slideRef) {
      const currentText = slideRef.innerText;
      const updatedText = currentText.replace(selectedText, expanded);
      slideRef.innerText = updatedText;
      
      // Update slides state
      const updatedSlides = [...slides];
      updatedSlides[editingSlideIndex].content = updatedText;
      setSlides(updatedSlides);
    }
    
    setShowActions(false);
    toast.success('Text developed!');
  };

  const handleGenerate = async () => {
    if (!file) {
      toast.error('Please upload a file');
      return;
    }

    if (!title) {
      toast.error('Please enter a presentation title');
      return;
    }

    setIsProcessing(true);
    setIsApproved(false);
    
    // Simulate AI processing
    setTimeout(() => {
      const generatedSlides: Slide[] = Array.from({ length: parseInt(slideCount) }, (_, i) => ({
        number: i + 1,
        title: i === 0 ? title : `Slide ${i + 1}: Key Point ${i}`,
        content: structure === 'bullet' 
          ? `Main point ${i + 1} from the document\nSupporting detail A\nSupporting detail B\nConclusion or takeaway`
          : `This slide presents key information extracted from the document. The content has been organized using the ${structure} structure and formatted according to the ${selectedTemplate} template. The AI has analyzed the source material and created a cohesive presentation flow that effectively communicates the main ideas.`,
      }));
      
      setSlides(generatedSlides);
      setIsProcessing(false);
      toast.success('Presentation content generated! Review and edit before approval.');
    }, 2500);
  };

  const handleApprove = () => {
    // Collect final content from all refs
    const finalSlides = slides.map((slide, index) => {
      const ref = slideRefs.current[index];
      return {
        ...slide,
        content: ref?.innerText || slide.content,
      };
    });
    
    setSlides(finalSlides);
    setIsApproved(true);
    
    addDocument({
      name: title,
      type: 'presentation',
      content: file?.name || '',
      result: JSON.stringify({ title, template: selectedTemplate, structure, slides: finalSlides }),
    });
    
    toast.success('Presentation approved and generated!');
  };

  const handleDownload = () => {
    const pptx = new pptxgen();
    const slideLayout = pptx.addSlide({ layout: 'TITLE' });
    slideLayout.addText(title, { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 48, color: '000000' });
    
    slides.forEach(slide => {
      const slideLayout = pptx.addSlide({ layout: 'TITLE' });
      slideLayout.addText(slide.title, { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 48, color: '000000' });
      slideLayout.addText(slide.content, { x: 0.5, y: 1.5, w: 9, h: 5, fontSize: 24, color: '000000' });
    });
    
    pptx.writeFile({ fileName: `${title}.pptx` });
    toast.success('Presentation downloaded!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Create Presentations</h1>
            <p className="text-gray-600">Upload a document and let AI create a professional presentation</p>
          </div>

          <div className="space-y-6">
            {/* Presentation Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Presentation Settings</CardTitle>
                <CardDescription>Configure your presentation options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="pres-title">Presentation Title</Label>
                  <Input
                    id="pres-title"
                    placeholder="Enter presentation title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="file-upload">Upload Document</Label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slide-count">Number of Slides</Label>
                    <Select value={slideCount} onValueChange={setSlideCount}>
                      <SelectTrigger id="slide-count" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Slides</SelectItem>
                        <SelectItem value="5">5 Slides</SelectItem>
                        <SelectItem value="7">7 Slides</SelectItem>
                        <SelectItem value="10">10 Slides</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="structure">Content Structure</Label>
                    <Select value={structure} onValueChange={setStructure}>
                      <SelectTrigger id="structure" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bullet">Bullet Points</SelectItem>
                        <SelectItem value="paragraph">Paragraph</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Template Selection */}
                <div>
                  <Label>Choose Template</Label>
                  <div className="grid grid-cols-5 gap-3 mt-2">
                    {TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`relative border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                          selectedTemplate === template.id
                            ? 'border-blue-600 shadow-md'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className={`${template.color} h-16 rounded mb-2`}></div>
                        <p className="text-xs text-center mb-1">{template.name}</p>
                        <p className="text-xs text-gray-500 text-center">{template.description}</p>
                        {selectedTemplate === template.id && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                            <Check className="size-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  className="w-full" 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <PresentationIcon className="size-4 mr-2" />
                      Generate Presentation Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Editable Slides Section */}
            {slides.length > 0 && !isApproved && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Edit Slides</CardTitle>
                  <CardDescription>
                    Edit the content below. Select text to get synonyms or develop phrases. Click "Approve & Generate" when ready.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {slides.map((slide, index) => (
                      <div key={slide.number} className="border rounded-lg p-4 bg-white">
                        <h4 className="font-medium mb-3 text-blue-600">
                          Slide {slide.number}: {slide.title}
                        </h4>
                        <div
                          ref={(el) => (slideRefs.current[index] = el)}
                          contentEditable
                          suppressContentEditableWarning
                          onMouseUp={(e) => handleTextSelection(e, index)}
                          className="bg-gray-50 rounded p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ whiteSpace: 'pre-wrap' }}
                        >
                          {slide.content}
                        </div>
                      </div>
                    ))}
                    
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
                    
                    <Button onClick={handleApprove} className="w-full gap-2">
                      <CheckCircle2 className="size-4" />
                      Approve & Generate Presentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Final Presentation Preview */}
            {isApproved && (
              <Card>
                <CardHeader>
                  <CardTitle>Presentation Preview</CardTitle>
                  <CardDescription>Your final presentation is ready</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-6 border max-h-[500px] overflow-y-auto">
                      <div className="flex items-center gap-2 mb-6 pb-3 border-b">
                        <h3 className="text-xl flex-1">{title}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {selectedTemplate}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {structure}
                        </span>
                      </div>
                      {slides.map((slide) => (
                        <div key={slide.number} className="mb-6 pb-4 border-b last:border-0">
                          <h4 className="mb-3 text-blue-600">
                            Slide {slide.number}: {slide.title}
                          </h4>
                          <div className="text-sm text-gray-700 ml-4" style={{ whiteSpace: 'pre-wrap' }}>
                            {slide.content}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleDownload} className="w-full">
                      <Download className="size-4 mr-2" />
                      Download Presentation (PPTX)
                    </Button>
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