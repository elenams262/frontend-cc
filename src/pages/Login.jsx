import { API_URL } from '../config/api';
import { useState } from 'react';
import { User, Dumbbell, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // <--- IMPORTANTE: Importamos esto

const Login = () => {
  const { login } = useAuth(); 
  const navigate = useNavigate(); // <--- IMPORTANTE: Hook para redirigir
  const [role, setRole] = useState(null); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Llamamos al login real
    const result = await login(email, password, role);
    
    if (result.success) {
        // 🚀 REDIRECCIÓN INTELIGENTE
        if (role === 'admin') {
            navigate('/admin/calibrantes'); // Si es Davi, va a su panel
        } else {
            navigate('/client/dashboard'); // Si es cliente, irá a su zona (cuando la creemos)
        }
    } else {
        setError(result.error);
    }
    setLoading(false);
  };

  // Estado para Reset Password
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetData, setResetData] = useState({ email: '', code: '', password: '', confirmPassword: '' });

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (resetData.password !== resetData.confirmPassword) {
        return setError("Las contraseñas no coinciden");
    }
    
    try {
        const res = await fetch(`${API_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: resetData.email,
                code: resetData.code,
                password: resetData.password
            })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            alert("✅ Contraseña actualizada correctamente. Ahora puedes iniciar sesión.");
            setShowResetModal(false);
            setResetData({ email: '', code: '', password: '', confirmPassword: '' });
        } else {
            setError(data.msg || "Error al restablecer contraseña");
        }
    } catch (err) {
        setError("Error de conexión");
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden relative">
        
        {/* MODAL RESET PASSWORD */}
        {showResetModal && (
            <div className="absolute inset-0 bg-white z-50 flex flex-col p-8 animate-fade-in">
                <h2 className="text-xl font-bold text-brand-primary mb-2">Recuperar Contraseña</h2>
                <p className="text-sm text-gray-500 mb-6">Introduce el código que te ha facilitado tu administrador.</p>
                
                {error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm mb-4">{error}</div>}

                <form onSubmit={handleResetSubmit} className="space-y-4 flex-1">
                    <input type="email" placeholder="Tu Email" required className="w-full p-3 border rounded-lg bg-gray-50" value={resetData.email} onChange={e => setResetData({...resetData, email: e.target.value})} />
                    <input type="text" placeholder="Código de Recuperación (6 letras)" required className="w-full p-3 border rounded-lg bg-gray-50 uppercase tracking-widest" maxLength={6} value={resetData.code} onChange={e => setResetData({...resetData, code: e.target.value.toUpperCase()})} />
                    <input type="password" placeholder="Nueva Contraseña" required className="w-full p-3 border rounded-lg bg-gray-50" value={resetData.password} onChange={e => setResetData({...resetData, password: e.target.value})} autoComplete="new-password" />
                    <input type="password" placeholder="Confirmar Contraseña" required className="w-full p-3 border rounded-lg bg-gray-50" value={resetData.confirmPassword} onChange={e => setResetData({...resetData, confirmPassword: e.target.value})} autoComplete="new-password" />
                    
                    <button type="submit" className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-brand-primary-light transition-colors mt-4">Restablecer Contraseña</button>
                </form>
                
                <button onClick={() => { setShowResetModal(false); setError(''); }} className="text-center text-gray-500 text-sm mt-4 hover:text-gray-800">Cancelar</button>
            </div>
        )}

        {/* Encabezado con Color Primario */}
        <div className="bg-brand-primary p-8 text-center flex flex-col items-center">
          <img src="/logo.png" alt="Logo" className="w-24 h-auto mb-4 brightness-0 invert" />
          <h1 className="text-3xl font-bold text-white mb-2">Calibrado Corporal</h1>
          <p className="text-brand-secondary-light">Comprende. Entrena. Transforma.</p>
        </div>

        {/* Cuerpo de la tarjeta */}
        <div className="p-8">
          {!role ? (
            // PASO 1: Selección de Rol
            <div className="space-y-4">
              <h2 className="text-xl text-brand-text font-semibold text-center mb-6">
                ¿Cómo quieres acceder?
              </h2>
              
              <button 
                onClick={() => setRole('client')}
                className="w-full flex items-center p-4 border-2 border-transparent hover:border-brand-secondary bg-brand-bg-light rounded-xl transition-all group"
              >
                <div className="bg-white p-3 rounded-full shadow-sm text-brand-primary group-hover:text-brand-action">
                  <User size={24} />
                </div>
                <span className="ml-4 text-lg font-medium text-brand-text">Soy Calibrante</span>
                <ArrowRight className="ml-auto text-gray-400 group-hover:text-brand-primary" size={20} />
              </button>

              <button 
                onClick={() => setRole('admin')}
                className="w-full flex items-center p-4 border-2 border-transparent hover:border-brand-secondary bg-brand-bg-light rounded-xl transition-all group"
              >
                <div className="bg-white p-3 rounded-full shadow-sm text-brand-primary group-hover:text-brand-action">
                  <Dumbbell size={24} />
                </div>
                <span className="ml-4 text-lg font-medium text-brand-text">Davi Martínez</span>
                <ArrowRight className="ml-auto text-gray-400 group-hover:text-brand-primary" size={20} />
              </button>
            </div>
          ) : (
            // PASO 2: Formulario de Login Real
            <div className="text-center">
              <h2 className="text-xl font-bold text-brand-primary mb-4">
                Acceso {role === 'client' ? 'Calibrante' : 'Calibradora'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Mensaje de error si falla el login */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm text-left">
                        ⚠️ {error}
                    </div>
                )}

                <input 
                  type="email" 
                  placeholder="Tu email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  required
                  autoComplete="username"
                />
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  required
                  autoComplete="current-password"
                />
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full text-white py-3 rounded-lg font-semibold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-primary hover:bg-brand-primary-light'}`}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
              
              {/* Opción Olvidé Contraseña */}
              <div className="mt-3 text-right">
                  <button onClick={() => { setShowResetModal(true); setError(''); }} className="text-xs text-brand-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                  </button>
              </div>

              {role === 'client' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">¿Tienes un código de invitación?</p>
                      <Link to="/activate" className="text-brand-action font-semibold hover:underline">
                          Activar mi cuenta
                      </Link>
                  </div>
              )}

              <button 
                onClick={() => { setRole(null); setError(''); }}
                className="mt-4 text-sm text-brand-text-muted hover:text-brand-primary underline"
              >
                Volver atrás
              </button>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default Login;

