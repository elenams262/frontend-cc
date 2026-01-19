import { API_URL } from '../../config/api';
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Search, Plus, PlayCircle, Filter, Trash2 } from 'lucide-react';
import axios from 'axios';
import NewExerciseModal from '../../components/NewExerciseModal';

const Ejercicios = () => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');

  const fetchExercises = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/exercises`);
      setExercises(res.data);
      setFilteredExercises(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  // Filtrado
  useEffect(() => {
    let result = exercises;
    
    // Filtro texto
    if (searchTerm) {
        result = result.filter(ex => 
            ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            ex.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }

    // Filtro categoría
    if (filterCategory !== 'Todos') {
        result = result.filter(ex => ex.category === filterCategory);
    }

    setFilteredExercises(result);
  }, [searchTerm, filterCategory, exercises]);

  // Función auxiliar para obtener ID de YouTube para miniatura
  const getYoutubeThumbnail = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
        ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` 
        : null;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este ejercicio?")) return;
    try {
        await axios.delete(`${API_URL}/api/admin/exercises/${id}`);
        // Recargar la lista
        fetchExercises();
    } catch (err) {
        console.error(err);
        alert("Error al eliminar el ejercicio");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-brand-primary">Biblioteca de Ejercicios</h1>
                <p className="text-gray-500">Gestiona y organiza tus recursos de vídeo.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto flex items-center justify-center space-x-2 bg-brand-action text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-md">
                <Plus size={20} />
                <span>Nuevo Ejercicio</span>
            </button>
        </div>

        {/* Barra de Herramientas */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o etiqueta..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-secondary outline-none"
                />
            </div>
            <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg outline-none focus:border-brand-secondary bg-white"
                >
                    <option value="Todos">Todas las categorías</option>
                    <option value="Movilidad">Movilidad</option>
                    <option value="Fuerza">Fuerza</option>
                    <option value="Respiración">Respiración</option>
                    <option value="Activación">Activación</option>
                </select>
            </div>
        </div>

        {/* Grid de Ejercicios */}
        {loading ? (
            <div className="text-center py-10 text-gray-400">Cargando biblioteca...</div>
        ) : filteredExercises.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                No hay ejercicios que coincidan con tu búsqueda.
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredExercises.map(ex => {
                    const thumb = getYoutubeThumbnail(ex.videoUrl);
                    return (
                        <div key={ex._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                            {/* Miniatura */}
                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                {thumb ? (
                                    <img src={thumb} alt={ex.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <PlayCircle size={40} />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                    {ex.category}
                                </div>
                            </div>
                            
                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-bold text-brand-primary truncate" title={ex.name}>{ex.name}</h3>
                                {ex.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {ex.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] bg-brand-bg px-2 py-0.5 rounded-full text-brand-text-muted">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-3 text-xs text-gray-400 flex justify-between items-center">
                                    <a href={ex.videoUrl} target="_blank" rel="noreferrer" className="hover:text-brand-action flex items-center gap-1">
                                        <PlayCircle size={14} /> Ver video
                                    </a>
                                    <button 
                                        onClick={() => handleDelete(ex._id)} 
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                        title="Eliminar ejercicio"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        <NewExerciseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onExerciseCreated={fetchExercises} />
    </div>
  );
};

export default Ejercicios;

