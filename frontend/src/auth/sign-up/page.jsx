import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      setErrors(['Les mots de passe ne correspondent pas']);
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setErrors(['Le mot de passe doit contenir au moins 6 caractères']);
      setLoading(false);
      return;
    }

    try {
      const requestBody = {
        Email: formData.email,
        Password: formData.password,
        ConfirmPassword: formData.confirmPassword
      };
      
      console.log('Envoi de la requête:', requestBody);

      const response = await fetch('https://localhost:7231/api/Auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Status de la réponse:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('Données reçues:', data);
      } catch (jsonError) {
        console.error('Erreur parsing JSON:', jsonError);
        setErrors(['Erreur de communication avec le serveur']);
        setLoading(false);
        return;
      }

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/auth/sign-in';
        }, 2000);
      } else {
        let errorMessages = [];
        
        if (data.errors) {
          if (Array.isArray(data.errors)) {
            errorMessages = data.errors;
          } else if (typeof data.errors === 'object') {
            errorMessages = Object.values(data.errors).flat();
          } else {
            errorMessages = [String(data.errors)];
          }
        } else if (data.message) {
          errorMessages = [data.message];
        } else {
          errorMessages = ['Une erreur est survenue lors de l\'inscription'];
        }
        
        setErrors(errorMessages);
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setErrors(['Impossible de se connecter au serveur. Vérifiez que l\'API est accessible.']);
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
          IdToken: credentialResponse.credential
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userEmail', data.email);
        
        setSuccess(true);
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setErrors(Array.isArray(data.errors) ? data.errors : [data.message || 'Erreur lors de la connexion Google']);
      }
    } catch (error) {
      console.error('Erreur Google Login:', error);
      setErrors(['Impossible de se connecter avec Google']);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Erreur Google Login');
    setErrors(['Échec de la connexion Google']);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#fdfcf8' }}>
      
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

          <div className="flex items-center">
            <a 
              href="/auth/sign-in" 
              className="bg-[#3b82f6] text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-all shadow-md font-bold text-[15px] inline-block"
            >
              Connexion
            </a>
          </div>
          
        </div>
      </nav>

      <main className="flex-grow flex flex-col lg:flex-row items-stretch">
        
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'serif' }}>
              Créer un compte
            </h1>
            <p className="text-slate-500 mb-8">Rejoignez notre communauté de passionnés de lecture.</p>

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl">
                <p className="font-bold">Inscription réussie !</p>
                <p className="text-sm">Redirection en cours...</p>
              </div>
            )}

            {errors.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
                {errors.map((error, index) => (
                  <p key={index} className="text-sm">{error}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  required
                  disabled={loading || success}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mot de passe</label>
                <input 
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading || success}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Minimum 6 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirmer le mot de passe</label>
                <input 
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={loading || success}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <button 
                type="submit"
                disabled={loading || success}
                className="w-full bg-[#3b82f6] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Inscription en cours...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </button>

              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="px-4 text-slate-400 text-sm">ou</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signup_with"
                  shape="rectangular"
                  size="large"
                  locale="fr"
                />
              </div>
            </form>
          </div>
        </div>

        <div className="w-full lg:w-1/2 relative hidden lg:block">
          <div className="absolute inset-0 h-full w-full overflow-hidden rounded-tl-[100px]">
            <img
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200"
              alt="Cozy library"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </main>
    </div>
  );
};

export default SignUpPage;