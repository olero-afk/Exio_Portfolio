import { usePersona } from '../../context/PersonaContext.tsx';
import './ClientFilter.css';

export function ClientFilter() {
  const { clients, selectedClientId, setSelectedClientId } = usePersona();

  return (
    <div className="client-filter">
      <span className="client-filter__label">KUNDE</span>
      <select
        className="client-filter__select"
        value={selectedClientId ?? ''}
        onChange={(e) => setSelectedClientId(e.target.value || null)}
      >
        <option value="">Alle kunder</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
    </div>
  );
}
