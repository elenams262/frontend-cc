import React from 'react';

const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 bg-brand-primary flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center">
        {/* Logo en blanco (invertido si el original es negro) */}
        <img 
            src="/logo.png" 
            alt="Calibrado Corporal" 
            className="w-32 h-auto mb-6 brightness-0 invert" 
        />
        
        {/* Spinner o Indicador de carga */}
        <div className="flex space-x-2">
            <div className="w-3 h-3 bg-brand-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-brand-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-brand-secondary rounded-full animate-bounce"></div>
        </div>

        <p className="mt-6 text-brand-secondary-light font-medium text-sm tracking-widest uppercase">
            Iniciando...
        </p>
      </div>
    </div>
  );
};

export default FullPageLoader;
