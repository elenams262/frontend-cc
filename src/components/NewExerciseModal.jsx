import { API_URL } from '../config/api';
import { getImageUrl } from '../utils/imageUtils';
import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Save, Video, Tag, Image as ImageIcon, Crop as CropIcon } from 'lucide-react';
import axios from 'axios';
import Cropper from 'react-easy-crop';

const CATEGORIES = ["Movilidad", "Fuerza", "Respiración", "Activación", "Estiramiento", "Cardio"];

const NewExerciseModal = ({ isOpen, onClose, onExerciseCreated, exerciseToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Movilidad',
    videoUrl: '',
    instructions: '',
    tags: ''
  });
  
  // Estados para imagen y recorte
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (exerciseToEdit) {
        setFormData({
            name: exerciseToEdit.name || '',
            category: exerciseToEdit.category || 'Movilidad',
            videoUrl: exerciseToEdit.videoUrl || '',
            instructions: exerciseToEdit.instructions || '',
            tags: exerciseToEdit.tags ? exerciseToEdit.tags.join(', ') : ''
        });

        // Cargar imagen existente para editar recorte si existe
        if (exerciseToEdit.image) {
            const fullImageUrl = getImageUrl(exerciseToEdit.image);
            setImageSrc(fullImageUrl);
            setIsCropping(true); 
            setCrop({ x: 0, y: 0 });
            setZoom(1);
        } else {
            setImageSrc(null);
            setIsCropping(false);
        }

      } else {
        setFormData({ name: '', category: 'Movilidad', videoUrl: '', instructions: '', tags: '' });
        setImageSrc(null);
        setIsCropping(false);
      }
    }
  }, [isOpen, exerciseToEdit]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setIsCropping(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  // Función para recortar la imagen y obtener el Blob
  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((file) => {
        resolve(file);
      }, 'image/jpeg');
    });
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous'); 
      image.src = url + '?' + new Date().getTime(); // Avoid cache for CORS
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('videoUrl', formData.videoUrl);
      data.append('instructions', formData.instructions);
      
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      tagsArray.forEach(tag => data.append('tags', tag));

      // Procesar la imagen recortada si existe
      if (imageSrc && isCropping && croppedAreaPixels) {
         const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
         data.append('image', croppedImageBlob, 'exercise-cover.jpg');
      }

      if (exerciseToEdit) {
        await axios.put(`${API_URL}/api/admin/exercises/${exerciseToEdit._id}`, data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        alert("✅ Ejercicio actualizado");
      } else {
        await axios.post(`${API_URL}/api/admin/exercises`, data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        alert("✅ Ejercicio añadido");
      }

      onExerciseCreated();
      onClose();
    } catch (error) {
      console.error("Error saving exercise:", error.response?.data || error.message);
      alert(`Error al guardar ejercicio: ${error.response?.data?.msg || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in my-8">
        <div className="bg-brand-primary p-4 flex justify-between items-center text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
                <Video size={20} /> {exerciseToEdit ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
            </h2>
            <button onClick={onClose}><X size={24} /></button>
        </div>

        <div className="p-6 space-y-6">
            {/* AREA DE RECORTE DE IMAGEN */}
            {isCropping && imageSrc ? (
                 <div className="relative w-full h-64 bg-gray-900 rounded-xl overflow-hidden mb-6">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={16 / 9}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                 </div>
            ) : null}

            {isCropping && (
                <div className="flex items-center gap-4 mb-4">
                     <span className="text-xs font-bold text-gray-500">Zoom</span>
                     <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(e.target.value)}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                     />
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Botón subir imagen */}
                <div className="flex justify-center">
                     <button
                        type="button" 
                        onClick={() => fileInputRef.current.click()}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                     >
                        <ImageIcon size={18} />
                        {imageSrc ? 'Cambiar Imagen' : 'Subir Imagen de Portada'}
                     </button>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                     />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Ejercicio</label>
                    <input required className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Cat-Camel" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                        <select className="w-full p-2 border rounded-lg" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (sep. comas)</label>
                         <div className="flex items-center border rounded-lg pr-2">
                            <input className="w-full p-2 rounded-l-lg outline-none" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="hombro, goma..." />
                            <Tag size={16} className="text-gray-400" />
                         </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enlace de Video</label>
                    <input className="w-full p-2 border rounded-lg" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} placeholder="URL..." />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones / Claves</label>
                    <textarea className="w-full p-2 border rounded-lg" rows="3" value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} placeholder="Mantén la espalda recta..." />
                </div>

                <div className="flex justify-end pt-2 border-t mt-4">
                    <button type="submit" disabled={loading} className="bg-brand-action text-white px-6 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-2">
                        <Save size={18} /> <span>{loading ? 'Guardando...' : (exerciseToEdit ? 'Actualizar' : 'Guardar Ejercicio')}</span>
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default NewExerciseModal;
