import { API_URL } from '../config/api';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

const ActivateAccount = () => {
    const [formData, setFormData] = useState({
        email: '',
        code: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); // Usamos login del contexto para guardar estado
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            return setError("Las contraseñas no coinciden");
        }
        if (formData.password.length < 6) {
           return setError("La contraseña debe tener al menos 6 caracteres");
        }

        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/api/auth/claim-account`, {
                email: formData.email,
                code: formData.code.toUpperCase(), // Asegurar mayúsculas
                password: formData.password
            });
            
            // Login exitoso
            login(res.data.token, { role: res.data.role }); 
            
            // Redirigir según rol
            if (res.data.role === 'admin') navigate('/admin');
            else navigate('/client/dashboard');

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || "Error al activar la cuenta");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-brand-primary"></div>
                
                <div className="text-center mb-8">
                    <div className="mb-4">
                        <img src="/logo.png" alt="Calibrado Corporal" className="h-16 w-auto mx-auto" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Activar Cuenta</h1>
                    <p className="text-gray-500 mt-2">Introduce el código que te ha facilitado tu entrenador.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-start gap-2">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="email" 
                                name="email"
                                required
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none"
                                placeholder="tu@email.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código de Invitación</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                name="code"
                                required
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none uppercase tracking-widest font-mono"
                                placeholder="XXXXXX"
                                value={formData.code}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="password" 
                                    name="password"
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none"
                                    placeholder="••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none"
                                    placeholder="••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-primary text-white py-2.5 rounded-lg font-bold hover:bg-brand-primary-light transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading ? 'Activando...' : (
                            <>Activar y Entrar <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/" className="text-sm text-brand-text-muted hover:text-brand-primary transition-colors">
                        ¿Ya tienes cuenta? Inicia sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ActivateAccount;

