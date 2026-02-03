
import React, { useState, useEffect } from 'react';
import { Star, Upload, Calendar, User, MessageSquare, CheckCircle, AlertCircle, Loader2, X, MapPin, Sparkles } from 'lucide-react';
import { ReviewFormData, Review, SubmissionStatus } from './types';
import { analyzeReview } from './services/geminiService';
import { Button } from './components/Button';

/**
 * ⚠️ CONFIGURATION ⚠️
 * Google Apps Script Web App URL
 */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzWCiGoK4bETcUkZZeX6Cu1uC6Tpg8lMgZQGsQVqeY4-L1aylxWqahEsTjU29lDsC7T/exec";

const App: React.FC = () => {
  // Helper to get today's date in YYYY-MM-DD format
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<ReviewFormData>({
    name: '',
    date: getTodayDate(), // Auto-filled with today's date
    rating: 5,
    message: '',
    image: null,
    imageName: ''
  });
  const [status, setStatus] = useState<SubmissionStatus>(SubmissionStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeField, setActiveField] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [latestAiResponse, setLatestAiResponse] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check for 20MB limit (20 * 1024 * 1024 bytes)
      if (file.size > 20 * 1024 * 1024) {
        setErrorMessage("File is too large. Max size is 20MB.");
        setStatus(SubmissionStatus.ERROR);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result as string,
          imageName: file.name
        }));
        setStatus(SubmissionStatus.IDLE); // Reset error if any
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(SubmissionStatus.SUBMITTING);
    setErrorMessage('');

    try {
      // 1. Analyze with AI to generate a management response
      const analysis = await analyzeReview(formData);
      setLatestAiResponse(analysis.managementResponse);
      
      // 2. Prepare payload including AI results
      const payload = {
        ...formData,
        aiResponse: analysis.managementResponse,
        sentiment: analysis.sentiment,
        timestamp: new Date().toISOString()
      };

      // 3. Send to Google Sheets via Web App URL
      // Using no-cors as per original implementation requirement for Apps Script
      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });
      
      // 4. Success state
      setStatus(SubmissionStatus.SUCCESS);
      setFormData({ 
        name: '', 
        date: getTodayDate(), 
        rating: 5, 
        message: '', 
        image: null, 
        imageName: '' 
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Submission error", error);
      setStatus(SubmissionStatus.ERROR);
      setErrorMessage("Failed to save your review to the guestbook. Please check your connection.");
    }
  };

  const ratingLabels: { [key: number]: string } = {
    1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent"
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] transition-colors duration-500 selection:bg-[#800000] selection:text-white pb-12">
      {/* Royal Background Ornament */}
      <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none select-none overflow-hidden" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #800000 1px, transparent 0)', backgroundSize: '48px 48px' }}>
      </div>

      <header className="relative z-20 bg-gradient-to-br from-[#600000] via-[#800000] to-[#500000] text-white py-8 shadow-xl">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block relative">
            <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-2 drop-shadow-lg">Shri Krishna Mahal</h1>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-[#fbbf24] shadow-[0_0_8px_#fbbf24]"></div>
          </div>
          <p className="mt-4 text-[10px] md:text-xs text-[#fbbf24] font-medium tracking-[0.3em] uppercase opacity-90">Elegance • Hospitality • Tradition</p>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 bg-[#f8f5f2] rounded-t-[100%] scale-x-110"></div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-12 flex justify-center">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-[2rem] shadow-[0_20px_80px_rgba(128,0,0,0.1)] overflow-hidden border border-orange-100 relative">
            <div className="h-1.5 bg-gradient-to-r from-[#800000] via-[#fbbf24] to-[#800000]"></div>
            
            <div className="p-6 md:p-12">
              {status === SubmissionStatus.SUCCESS ? (
                <div className="text-center py-6 animate-fade-in">
                  <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-green-100 ring-4 ring-green-50/50">
                    <CheckCircle size={56} className="animate-bounce" />
                  </div>
                  <h2 className="text-3xl font-serif text-gray-900 font-bold mb-3">Thank You!</h2>
                  <p className="text-gray-600 mb-8 leading-relaxed font-medium">
                    Your feedback has been recorded in our official guestbook.
                  </p>
                  
                  {latestAiResponse && (
                    <div className="bg-[#f8f5f2] p-6 md:p-8 rounded-2xl border border-gray-100 text-left mb-8 relative shadow-sm">
                      <Sparkles className="absolute -top-3 -right-3 text-[#fbbf24] fill-[#fbbf24] drop-shadow-md" size={24} />
                      <div className="text-[9px] uppercase tracking-widest font-black text-[#800000] mb-2 opacity-60">Management Response</div>
                      <p className="text-base italic text-gray-700 leading-relaxed font-serif">
                        "{latestAiResponse}"
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="p-5 bg-[#fbbf24]/5 rounded-xl border border-[#fbbf24]/20">
                      <p className="text-sm text-gray-700 font-bold mb-3">We appreciate you dropping reviews in Google also!</p>
                      <a 
                        href="https://maps.app.goo.gl/ZYEZsXKHkDQsRvGV9" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-4 bg-[#800000] text-white rounded-xl font-bold shadow-lg shadow-[#800000]/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                      >
                        <MapPin size={18} /> Write a Google Review
                      </a>
                    </div>
                    
                    <button 
                      onClick={() => setStatus(SubmissionStatus.IDLE)}
                      className="text-xs font-bold text-gray-400 hover:text-[#800000] transition-colors"
                    >
                      Submit Another Experience
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-serif text-[#800000] font-bold mb-2">Your Guest Story</h2>
                    <p className="text-gray-400 text-xs italic">Share the moments you cherished</p>
                    <div className="w-12 h-0.5 bg-[#fbbf24] mx-auto rounded-full mt-3 opacity-60"></div>
                  </div>

                  <div className="space-y-6">
                    {/* Guest Name */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 ml-1">Guest Name</label>
                      <div className="relative group">
                        <User size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${activeField === 'name' ? 'text-[#800000]' : 'text-gray-300'}`} />
                        <input
                          required
                          name="name"
                          value={formData.name}
                          onFocus={() => setActiveField('name')}
                          onBlur={() => setActiveField(null)}
                          onChange={handleInputChange}
                          placeholder="Your Full Name"
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#800000]/20 focus:ring-4 focus:ring-[#800000]/5 transition-all text-sm font-semibold"
                        />
                      </div>
                    </div>

                    {/* Auto-filled Date Display */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 ml-1">Date of Visit</label>
                      <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 italic text-sm">
                        <Calendar size={18} className="text-gray-300" />
                        <span>{new Date(formData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span className="ml-auto text-[10px] uppercase tracking-tighter bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold not-italic">Auto-filled</span>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="space-y-4 py-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 ml-1">Your Experience Rating</label>
                        <span className="text-[10px] font-bold text-[#800000] bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                          {ratingLabels[hoverRating || formData.rating]}
                        </span>
                      </div>
                      <div className="flex justify-between max-w-xs mx-auto" onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                            onMouseEnter={() => setHoverRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110 active:scale-90 p-1"
                          >
                            <Star 
                              size={36} 
                              fill={star <= (hoverRating || formData.rating) ? "#fbbf24" : "none"} 
                              strokeWidth={1.5}
                              className={`transition-all duration-300 ${star <= (hoverRating || formData.rating) ? 'text-[#fbbf24] drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]' : 'text-gray-200'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feedback Message */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 ml-1">Your Review</label>
                      <div className="relative group">
                        <MessageSquare size={18} className={`absolute left-4 top-5 transition-colors duration-300 ${activeField === 'message' ? 'text-[#800000]' : 'text-gray-300'}`} />
                        <textarea
                          required
                          name="message"
                          value={formData.message}
                          rows={4}
                          onFocus={() => setActiveField('message')}
                          onBlur={() => setActiveField(null)}
                          onChange={handleInputChange}
                          placeholder="Share your experience here.."
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#800000]/20 focus:ring-4 focus:ring-[#800000]/5 transition-all text-sm font-semibold resize-none"
                        />
                      </div>
                    </div>

                    {/* Image Memory */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 ml-1">Add a photo (Optional)(Max 20MB)</label>
                      {!formData.image ? (
                        <div className="relative group border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-[#800000]/30 transition-all cursor-pointer">
                          <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                          <div className="flex flex-col items-center">
                            <div className="p-3 bg-gray-100 rounded-full mb-3 group-hover:bg-[#800000]/10 transition-colors">
                              <Upload size={24} className="text-gray-400 group-hover:text-[#800000]" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 group-hover:text-gray-600">Upload Your Memory</span>
                            <span className="text-[9px] text-gray-300 mt-1 uppercase tracking-widest">JPEG, PNG up to 20MB</span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative rounded-xl overflow-hidden shadow group border border-gray-100">
                          <img src={formData.image} alt="Guest memory" className="w-full h-48 object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-3">
                            <button 
                              onClick={() => setFormData(prev => ({ ...prev, image: null, imageName: '' }))}
                              className="bg-white text-red-600 px-5 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-50 transition-colors text-xs"
                            >
                              <X size={16} /> Remove
                            </button>
                            <span className="text-white text-[10px] font-medium px-4 truncate max-w-full">{formData.imageName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {status === SubmissionStatus.ERROR && (
                    <div className="flex items-center gap-3 text-red-700 bg-red-50 p-4 rounded-xl text-xs font-bold border border-red-100 animate-fade-in">
                      <AlertCircle size={20} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full py-5 text-lg rounded-xl shadow-xl shadow-[#800000]/10" 
                    isLoading={status === SubmissionStatus.SUBMITTING}
                  >
                    {status === SubmissionStatus.SUBMITTING ? (
                      <>
                        <Loader2 className="animate-spin" /> Finalizing Guest Entry...
                      </>
                    ) : (
                      "Confirm My Feedback"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-8 text-center">
        <p className="text-[10px] text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} Shri Krishna Mahal. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default App;
