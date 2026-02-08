import React, { useState, useEffect } from 'react';
import { BookOpen, Lock, LogOut, Eye, EyeOff, Check, X, Settings, User, Edit2, Save } from 'lucide-react';

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    favoriteGenre: '',
    readingGoal: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // CHARGEMENT DES DONNÉES 
  useEffect(() => {
    const storedUser = localStorage.getItem('userProfile');
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
      } catch (e) {
        console.warn('Erreur de parsing profile');
      }
    }
  }, []);

  const getUserInitial = () => {
    if (userInfo.firstName) return userInfo.firstName.charAt(0).toUpperCase();
    return 'U';
  };

  const getUserDisplayName = () => {
    if (userInfo.firstName && userInfo.lastName) return `${userInfo.firstName} ${userInfo.lastName}`;
    return userInfo.firstName || userInfo.email?.split('@')[0] || 'Utilisateur';
  };

  const handleSaveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(userInfo));
    setIsEditingProfile(false);
    setProfileMessage({ type: 'success', text: 'Profil mis à jour !' });
    setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = 'http://localhost:3000/';
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Tous les champs sont obligatoires' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
      
      const response = await fetch('https://localhost:7231/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          OldPassword: currentPassword,     
          NewPassword: newPassword,         
          ConfirmPassword: confirmPassword  
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        let errorTxt = "Erreur lors de la mise à jour";
        if (data.errors) {
            const firstKey = Object.keys(data.errors)[0];
            errorTxt = data.errors[firstKey][0] || data.errors[firstKey];
        } else if (typeof data === 'string') {
            errorTxt = data;
        } else if (data.message) {
            errorTxt = data.message;
        }
        setPasswordMessage({ type: 'error', text: errorTxt });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Connexion au serveur impossible' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
        <div className="min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#fdfcf8' }}>

      {/* NAVBAR */}
      <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50 shadow-sm">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="BiblioHome Logo" className="h-11 w-auto" />
        </div>
        <div className="flex items-center space-x-8 text-[11px] font-bold tracking-[0.15em] text-gray-500 uppercase">
          <a href="/books" className="hover:text-black transition-colors">Explorer</a>
          <a href="/mes-livres" className="hover:text-black transition-colors">Mes Livres</a>
          <a href="/statistiques" className="hover:text-black transition-colors">Statistiques</a>
          <div 
            className="w-10 h-10 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-all border-l border-gray-200 ml-8"
            onClick={() => window.location.href = '/parametres'}
          >
            <Settings className="w-5 h-5 text-white" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-serif italic text-gray-800 mb-3">Paramètres</h1>
          <p className="text-gray-500">Gérez votre compte et votre sécurité</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 sticky top-24">
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                    {getUserInitial()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                </div>
                <h3 className="font-bold text-xl text-center mb-1">{getUserDisplayName()}</h3>
                <p className="text-gray-500 text-sm text-center break-all mb-4">{userInfo.email}</p>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">Membre Actif</span>
              </div>

              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm flex items-center gap-3">
                  <User className="w-4 h-4" /> Mon Profil
                </button>
                <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-bold text-sm flex items-center gap-3">
                  <Lock className="w-4 h-4" /> Sécurité
                </button>
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button onClick={() => setShowLogoutModal(true)} className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-bold text-sm flex items-center gap-3 transition-all">
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            
            {/* SECTION PROFIL */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Informations personnelles</h2>
                </div>
                <button 
                  onClick={isEditingProfile ? handleSaveProfile : () => setIsEditingProfile(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-bold transition-all ${isEditingProfile ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isEditingProfile ? <Save className="w-4 h-4"/> : <Edit2 className="w-4 h-4"/>}
                  {isEditingProfile ? "Enregistrer" : "Modifier"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Prénom</label>
                  <input 
                    disabled={!isEditingProfile}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none bg-gray-50 transition-all"
                    value={userInfo.firstName}
                    onChange={(e) => setUserInfo({...userInfo, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nom</label>
                  <input 
                    disabled={!isEditingProfile}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none bg-gray-50 transition-all"
                    value={userInfo.lastName}
                    onChange={(e) => setUserInfo({...userInfo, lastName: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* SECTION MOT DE PASSE */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Sécurité du compte</h2>
              </div>

              {passwordMessage.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border-2 ${passwordMessage.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                  {passwordMessage.type === 'success' ? <Check size={20}/> : <X size={20}/>}
                  <span className="font-medium text-sm">{passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="max-w-md">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe actuel</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none transition-all"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-3.5 text-gray-400">
                      {showCurrentPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nouveau mot de passe</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-3.5 text-gray-400">
                        {showNewPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Confirmer le nouveau</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-gray-400">
                        {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full md:w-auto px-8 py-4 bg-black text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  {passwordLoading ? "Chargement..." : "Mettre à jour le mot de passe"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE DÉCONNEXION */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <LogOut className="text-red-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Déconnexion</h3>
            <p className="text-gray-500 text-sm text-center mb-8">Êtes-vous sûr de vouloir quitter BiblioHome ?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 p-4 rounded-2xl font-bold text-xs uppercase bg-gray-100 hover:bg-gray-200 transition-all">Annuler</button>
              <button onClick={handleLogout} className="flex-1 p-4 rounded-2xl font-bold text-xs uppercase bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-100">Quitter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;