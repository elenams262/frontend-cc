import { useState } from 'react';
import { X, Save, Copy, Check } from 'lucide-react';
import axios from 'axios';

const NewCalibranteModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    objective: '',
    limitations: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState(null); // Para guardar el código generado

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Preparar datos para el backend
      const payload = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        profile: {
          objectives: [formData.objective],
          limitations: formData.limitations.split(',').map(s => s.trim()).filter(Boolean),
          status: "Recién llegado"
        }
      };

      // 2. Enviar al backend
      const res = await axios.post('http://localhost:5000/api/admin/users', payload);
      
      // 3. Éxito: Guardar código para mostrar
      setCreatedCode(res.data.inviteCode);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Error al crear calibrante");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
      setCreatedCode(null);
      setFormData({ name: '', surname: '', email: '', objective: '', limitations: '' });
      onUserCreated();
      onClose();
  };

  const copyCode = () => {
      navigator.clipboard.writeText(createdCode);
      alert("Código copiado al portapapeles");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
        
        {/* Cabecera */}
        <div className="bg-brand-primary p-6 flex justify-between items-center text-white">
            <h2 className="text-xl font-bold">{createdCode ? "¡Calibrante Creado!" : "Nuevo Calibrante"}</h2>
            <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* CONTENIDO */}
        {createdCode ? (
            <div className="p-10 flex flex-col items-center text-center space-y-6">
                <div className="bg-green-100 p-4 rounded-full text-green-600 mb-2">
                    <Check size={48} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">Usuario creado correctamente</h3>
                    <p className="text-gray-500 mt-2">Comparte este código con el alumno para que pueda activar su cuenta.</p>
                </div>
                
                <div className="bg-gray-100 p-6 rounded-xl border-2 border-dashed border-gray-300 w-full max-w-xs relative flex items-center justify-center gap-3">
                    <span className="text-3xl font-mono font-bold tracking-widest text-brand-primary selection:bg-brand-secondary">{createdCode}</span>
                    <button onClick={copyCode} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary transition-colors" title="Copiar">
                        <Copy size={20} />
                    </button>
                </div>

                <button onClick={handleCloseSuccess} className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-primary-light transition-colors shadow-lg">
                    Entendido, finalizar
                </button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Datos Personales */}
                    <div className="space-y-4">
                        <h3 className="text-brand-text font-semibold border-b pb-2">Datos Personales</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input required name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" placeholder="Ej: Ana" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                            <input required name="surname" value={formData.surname} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" placeholder="Ej: García" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" placeholder="email@ejemplo.com" />
                        </div>
                    </div>

                    {/* Perfil Inicial */}
                    <div className="space-y-4">
                        <h3 className="text-brand-text font-semibold border-b pb-2">Perfil Inicial</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo Principal</label>
                            <textarea required name="objective" value={formData.objective} onChange={handleChange} rows="2" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" placeholder="Ej: Reducir dolor lumbar y ganar fuerza..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dolores / Limitaciones (sep. por comas)</label>
                            <input name="limitations" value={formData.limitations} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none" placeholder="Ej: Rodilla derecha, Lumbar..." />
                        </div>
                    </div>
                </div>

                {/* Footer con acciones */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex items-center space-x-2 bg-brand-action text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm disabled:bg-gray-400"
                    >
                        <Save size={18} />
                        <span>{loading ? 'Creando...' : 'Generar Calibrante'}</span>
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default NewCalibranteModal;
