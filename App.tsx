import React, { useState } from 'react';
import { VideoUploader } from './components/VideoUploader';
import { AnalysisResult } from './components/AnalysisResult';
import { analyzeInterview } from './services/geminiService';
import { InterviewAnalysis, UploadStatus } from './types';
import { Bot, Sparkles, FileText, Loader2, ArrowRight, Mic, MonitorPlay } from 'lucide-react';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [analysisResult, setAnalysisResult] = useState<InterviewAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!videoFile) return;

    setStatus(UploadStatus.UPLOADING);
    setErrorMessage(null);

    try {
      const result = await analyzeInterview(videoFile, jobDescription);
      setAnalysisResult(result);
      setStatus(UploadStatus.READY);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Something went wrong during analysis.");
      setStatus(UploadStatus.ERROR);
    }
  };

  const handleReset = () => {
    setVideoFile(null);
    setJobDescription('');
    setAnalysisResult(null);
    setStatus(UploadStatus.IDLE);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 bg-opacity-80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                InterviewCoach AI
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500 hidden sm:block">Powered by Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {analysisResult ? (
          <AnalysisResult analysis={analysisResult} onReset={handleReset} />
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                Master Your Next Interview
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                Upload a practice interview recording. Get instant, AI-powered feedback on your verbal delivery, body language, and content.
              </p>
            </div>

            {/* Input Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              
              <div className="p-8 space-y-8">
                
                {/* Step 1: Context */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs">1</div>
                    <FileText className="w-4 h-4 text-slate-500" />
                    Job Description / Context (Optional)
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here, or briefly describe the role you are applying for (e.g., 'Senior React Developer at a Fintech startup'). This helps the AI assess content relevance."
                    className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none transition-all text-sm"
                  />
                </div>

                {/* Step 2: Video */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs">2</div>
                    Upload Recording
                  </label>
                  <VideoUploader 
                    onFileSelect={setVideoFile} 
                    selectedFile={videoFile} 
                  />
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-slate-100">
                  {errorMessage && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                       <span className="font-bold">Error:</span> {errorMessage}
                    </div>
                  )}

                  <button
                    onClick={handleAnalyze}
                    disabled={!videoFile || status === UploadStatus.UPLOADING}
                    className={`
                      w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform
                      ${!videoFile || status === UploadStatus.UPLOADING
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5'
                      }
                    `}
                  >
                    {status === UploadStatus.UPLOADING ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Analyzing Interview...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Get AI Feedback
                        <ArrowRight className="w-5 h-5 opacity-70" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4">
                    Note: For this demo, please use videos under 50MB. Analysis may take up to 30 seconds.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 px-4">
               <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <Mic className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Speech Analysis</h3>
                  <p className="text-sm text-slate-500">Detects pace, tone, filler words, and clarity of expression.</p>
               </div>
               <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600">
                    <MonitorPlay className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Screen Presence</h3>
                  <p className="text-sm text-slate-500">Evaluates body language, eye contact, and screen share clarity.</p>
               </div>
               <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Smart Context</h3>
                  <p className="text-sm text-slate-500">Understands the job role to assess if your answers are relevant.</p>
               </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;