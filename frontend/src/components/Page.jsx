import React, { useState, useEffect } from 'react';

const Page = () => {
  const [quote, setQuote] = useState({
    text: 'La lecture est une amitié',
    author: 'Marcel Proust'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('https://localhost:7231/api/Quotes/random');
        if (response.ok) {
          const data = await response.json();
          setQuote({
            text: data.quote || data.text,
            author: data.author
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la citation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#fdfcf8' }}>
      
      {/* Navbar avec fond blanc */}
      <nav className="w-full px-6 lg:px-12 py-4 bg-white shadow-sm relative z-20">
        <div className="flex justify-between items-center w-full">
          
          {/* LOGO */}
          <div className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="BiblioHome Logo" 
              className="h-11 w-auto"
            />
          </div>

          {/* BOUTONS AVEC REDIRECTION */}
          <div className="flex items-center space-x-8">
            <a 
              href="/auth/sign-in" 
              className="text-[#1a202c] hover:opacity-70 font-bold text-[15px] transition-opacity"
            >
              Connexion
            </a>
            
            <a 
              href="/auth/sign-up" 
              className="bg-[#3b82f6] text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-all shadow-md font-bold text-[15px] inline-block"
            >
              S'inscrire
            </a>
          </div>
          
        </div>
      </nav>

      <main className="flex-grow flex flex-col lg:flex-row items-stretch">
        
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-20">
          <div className="max-w-xl">
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-8" style={{ fontFamily: 'serif' }}>
              Votre <br />
              bibliothèque, <br />
              <span className="text-[#3b82f6] italic font-medium">
                partout avec vous
              </span>
            </h1>
            
            <p className="text-[18px] text-slate-600 mb-12 leading-relaxed max-w-md">
              Organisez, suivez et redécouvrez votre collection de livres en un clin d'œil avec une interface conçue pour les passionnés.
            </p>

            {/* Citation Card Dynamique */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-sm min-h-[140px] flex flex-col justify-center">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <p className="text-[#1a202c] italic text-xl mb-4 font-serif">
                    « {quote.text} »
                  </p>
                  <p className="text-gray-400 text-xs tracking-widest font-bold uppercase">
                    — {quote.author}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CÔTÉ DROIT  */}
        <div className="w-full lg:w-1/2 relative">
          <div className="absolute inset-0 h-full w-full overflow-hidden rounded-tl-[100px]">
            <img
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200"
              alt="Cozy reading space"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Page;