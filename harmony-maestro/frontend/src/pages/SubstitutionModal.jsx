// --- Componente Modal para Substituição ---
const SubstitutionModal = ({ 
    memberToReplace, 
    allMembers, 
    scheduleId, 
    onClose, 
    token, 
    API_URL, 
    fetchScaleData, 
    setMessage 
}) => {
    
    // Lista de membros elegíveis para substituir (todos exceto o que está sendo substituído)
    const availableSubstitutes = allMembers.filter(m => m.id !== memberToReplace.id);

    const [newSubstituteId, setNewSubstituteId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirmSubstitution = async () => {
        if (!newSubstituteId) {
            setMessage("Selecione um membro para a substituição.");
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const res = await fetch(`${API_URL}/substitute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    scheduleId: scheduleId,
                    userToRemoveId: memberToReplace.id,
                    newSubstituteId: Number(newSubstituteId), // Garante que é um número
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Falha ao realizar substituição');

            setMessage(`Substituição realizada com sucesso!`);
            await fetchScaleData(); // Recarrega os dados para mostrar o membro substituído
            onClose();

        } catch (err) {
            setMessage(`Erro na substituição: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-red-600"/> Substituir Músico
                    </h3>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        Você está substituindo: <strong className="font-bold text-red-600">{memberToReplace.name} ({memberToReplace.instrumento})</strong>.
                        Selecione o novo músico escalado.
                    </p>

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Novo Substituto:
                    </label>
                    <select
                        value={newSubstituteId}
                        onChange={(e) => setNewSubstituteId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                        disabled={loading}
                    >
                        <option value="">-- Selecione um membro --</option>
                        {availableSubstitutes.map(member => (
                            <option key={member.id} value={member.id}>
                                {member.name} ({member.instrumento})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmSubstitution}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        disabled={loading || !newSubstituteId}
                    >
                        {loading ? 'Substituindo...' : 'Confirmar Substituição'}
                    </button>
                </div>
            </div>
        </div>
    );
};