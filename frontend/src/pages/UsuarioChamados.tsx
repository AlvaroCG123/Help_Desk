import React from 'react';

const UsuarioChamados = () => {
    // Array simulando os dados para renderizar os múltiplos cards como na imagem
    const chamados = [
        { id: 1, titulo: 'Titulo dele pararara', data: '10/02/2026', status: 'EM ATENDIMENTO' },
        { id: 2, titulo: 'Titulo dele pararara', data: '10/02/2026', status: 'EM ATENDIMENTO' },
        { id: 3, titulo: 'Titulo dele pararara', data: '10/02/2026', status: 'EM ATENDIMENTO' },
        { id: 4, titulo: 'Titulo dele pararara', data: '10/02/2026', status: 'EM ATENDIMENTO' },
        { id: 5, titulo: 'Titulo dele pararara', data: '10/02/2026', status: 'EM ATENDIMENTO' },
        { id: 6, titulo: 'Titulo dele pararara', data: '10/02/2026', status: 'ABERTO' },
        { id: 7, titulo: 'Titulo dele pararara', data: '10/02/2026', status: 'EM ATENDIMENTO' },
        { id: 8, titulo: 'Titulo dele pararara', data: '10/02/2026', status: 'CONCLUÍDO' },
    ];

    // Função para definir a cor da tag dependendo do status
    const getStatusStyle = (status) => {
        switch (status) {
            case 'EM ATENDIMENTO':
                return 'bg-blue-100 text-blue-700';
            case 'ABERTO':
                return 'bg-gray-200 text-gray-700';
            case 'CONCLUÍDO':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <main className="bg-[#f0f2f5] min-h-screen font-sans pb-10">
            {/* Navbar */}
            <nav className="px-8 py-4 bg-[#1a2b4c] flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-wide">Help-Desk</h1>
                </div>
                
                <div className="flex items-center gap-4">
                    <button className="border border-gray-400 text-gray-200 hover:text-white hover:border-white font-medium py-1.5 px-6 rounded-full transition-colors">
                        Sair
                    </button>
                    {/* Avatar do Usuário */}
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-blue-400 cursor-pointer">
                        <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </nav>

            {/* Container Principal */}
            <div className="max-w-7xl mx-auto px-6 mt-10">
                {/* Cabeçalho da Seção */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl text-[#1a2b4c] font-bold">Meus Chamados</h1>
                    <button className="flex items-center gap-2 text-white bg-[#1a2b4c] hover:bg-[#111e36] py-2.5 px-5 rounded-lg font-medium transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Novo Chamado
                    </button>
                </div>

                {/* Grid de Chamados */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {chamados.map((chamado, index) => (
                        <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                            {/* Título e Data */}
                            <div>
                                <h2 className="text-lg text-gray-900 font-bold mb-1">{chamado.titulo}</h2>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>{chamado.data}</span>
                                    {chamado.status === 'EM ATENDIMENTO' && <span>ticket ID</span>}
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex">
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${getStatusStyle(chamado.status)}`}>
                                    {chamado.status}
                                    {chamado.status === 'EM ATENDIMENTO' && (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    )}
                                </span>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex flex-col gap-2 mt-2">
                                <button className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 py-2 rounded-lg text-sm font-medium transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                                    </svg>
                                    Ver Histórico
                                </button>
                                <button className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 py-2 rounded-lg text-sm font-medium transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                    Cancelar Chamado
                                </button>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </main>
    );
};

export default UsuarioChamados;