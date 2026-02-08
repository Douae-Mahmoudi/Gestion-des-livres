import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const response = await fetch('https://localhost:7231/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Stocker le token JWT dans localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('userEmail', data.email);
        }
        
        // Redirection vers la page des livres
        window.location.href = '/books';
      } else {
        setErrors(data.errors || ['Email ou mot de passe incorrect']);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setErrors(['Impossible de se connecter au serveur']);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setErrors([]);
      
      const response = await fetch('https://localhost:7231/api/Auth/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Stocker le token dans localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userEmail', data.email);
        
        // Redirection vers le dashboard
        window.location.href = '/books';
      } else {
        setErrors(data.errors || ['Erreur lors de la connexion Google']);
      }
    } catch (error) {
      console.error('Erreur Google Login:', error);
      setErrors(['Impossible de se connecter avec Google']);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors(['Échec de la connexion Google']);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#fdfcf8' }}>
      
      {/* Navbar avec redirections fixées */}
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
          {/* BOUTON S'INSCRIRE  */}
          <div className="flex items-center">
            <a 
              href="/auth/sign-up" 
              className="bg-[#3b82f6] text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-all shadow-md font-bold text-[15px] inline-block"
            >
              S'inscrire
            </a>
          </div>
          
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col lg:flex-row items-stretch">
        
        {/* Formulaire de connexion */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-20">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'serif' }}>
              Bon retour !
            </h1>
            <p className="text-slate-500 mb-8">Veuillez entrer vos détails pour vous connecter.</p>

            {/* Messages d'erreur */}
            {errors.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
                {errors.map((error, index) => (
                  <p key={index} className="text-sm">{error}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemple@mail.com"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mot de passe</label>
                <input 
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Bouton Se Connecter */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#3b82f6] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>

              {/* Séparateur */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="px-4 text-slate-400 text-sm">ou</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Bouton Google */}
              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="continue_with"
                  shape="rectangular"
                  size="large"
                  width="100%"
                  locale="fr"
                />
              </div>

              {/* Lien vers inscription */}
              <p className="text-center text-sm text-slate-500 mt-4">
                Pas encore de compte ?{' '}
                <a href="/auth/sign-up" className="text-blue-500 font-bold hover:text-blue-600">
                  S'inscrire
                </a>
              </p>
            </form>
          </div>
        </div>

        <div className="w-full lg:w-1/2 relative hidden lg:block">
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

export default SignInPage;