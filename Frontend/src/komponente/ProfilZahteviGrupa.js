import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';

const ProfilZahteviGrupa = () => {
  const [zahtevi, setZahtevi] = useState({ poslati: [], primljeni: [] });
  const [loading, setLoading] = useState(true);
  const korisnik = useContext(AppContext).korisnik
  const setNaProfilu = useContext(AppContext).setNaProfilu
  const navigate = useNavigate()
  const jezik = useContext(AppContext).jezik

  useEffect(() => {
    const fetchZahteviGrupa = async () => {
      const token = sessionStorage.getItem("jwt");
      try {
        const response = await fetch('https://localhost:7080/Majstor/GetZahteviGrupa', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          window.alert(jezik.general.error.netGreska + ": " + await response.text())
        }

        const data = await response.json();
        setZahtevi(data);
        setLoading(false);
      } catch (error) {
        window.alert(jezik.general.error.netGreska + ": " + error.message)
      }
    };

    fetchZahteviGrupa();
  }, []);

  const handleResponse = async (id, odg) => {
    const token = sessionStorage.getItem("jwt");
    try {
      const response = await fetch(`https://localhost:7080/Majstor/odgovorZahtevGrupa/${id}/${odg}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok){
        window.location.reload()
      }
      else {
        window.alert(jezik.general.error.netGreska + ": " + await response.text())
      }
    } catch (error) {
      window.alert(jezik.general.error.netGreska + ": " + error.message)
    }
  }

  const handlePovuci = async id => {
    const token = sessionStorage.getItem("jwt");
    try {
      const response = await fetch(`https://localhost:7080/Majstor/povuciZahtevGrupa/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok){
        window.location.reload()
      }
      else {
        window.alert(jezik.general.error.netGreska + ": " + await response.text())
      }
    } catch (error) {
      window.alert(jezik.general.error.netGreska + ": " + error.message)
    }
  }

  const handleNapraviGrupu = async id => {
    setNaProfilu(false)
    navigate('../register_craftsman_group')
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {zahtevi.poslatiZahtevi.length > 0 && (
        <div className="border border-gray-200 rounded p-4">
          <h2 className="text-lg font-semibold">Poslati zahtevi:</h2>
          <ul className="list-disc list-inside mt-2">
            {zahtevi.poslatiZahtevi.map((zahtev, index) => (
              <li key={index} className="mt-2">
                <p><span className="font-semibold">Opis:</span> {zahtev.opis}</p>
                <span className="font-semibold">Tip:</span> {zahtev.tip}, <span className="font-semibold">Korisnik:</span> {zahtev.korisnik}, <span className="font-semibold">Prihvacen:</span> {zahtev.prihvacen ? 'Da' : 'Ne'}
                {zahtev.prihvacen === 0 ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePovuci(zahtev.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Povuci
                    </button>
                  </div>
                ) : korisnik.tipMajstora === 'majstor' ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleNapraviGrupu(zahtev.id)}
                      className="px-4 py-2 rounded"
                    >
                      Napravi Grupu
                    </button>
                  </div>
                ) : (
                  <></>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {zahtevi.primljeniZahtevi.length > 0 && (
        <div className="border border-gray-200 rounded p-4">
          <h2 className="text-lg font-semibold">Primljeni zahtevi:</h2>
          <ul className="list-disc list-inside mt-2">
            {zahtevi.primljeniZahtevi.map((zahtev, index) => (
              <li key={index} className="mt-2">
                <p><span className="font-semibold">Opis:</span> {zahtev.opis}</p>
                <span className="font-semibold">Tip:</span> {zahtev.tip}, <span className="font-semibold">Korisnik:</span> {zahtev.korisnik}, <span className="font-semibold">Prihvacen:</span> {zahtev.prihvacen ? 'Da' : 'Ne'}
                {zahtev.prihvacen === 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleResponse(zahtev.id, 1)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Prihvati
                    </button>
                    <button
                      onClick={() => handleResponse(zahtev.id, 0)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Odbij
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfilZahteviGrupa