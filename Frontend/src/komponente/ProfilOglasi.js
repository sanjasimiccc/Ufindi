import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';

export default function ProfilOglasi() {
    const [oglasi, setOglasi] = useState([]);
    const [loading, setLoading] = useState(true);
    const korisnik = useContext(AppContext).korisnik
    const jezik = useContext(AppContext).jezik
    //const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOglasi = async () => {
            try {
                const response = await fetch('https://localhost:7080/Korisnik/getOglasi', {
                    headers: {
                        'Authorization': `bearer ${sessionStorage.getItem('jwt')}` 
                    }
                });
    
                if (!response.ok) {
                    window.alert(jezik.general.error.netGreska + ": " + await response.text())
                }
    
                const data = await response.json();
    
                if (Array.isArray(data)) { //ako je niz
                    setOglasi(data);
                    setLoading(false);
                } else {
                    window.alert(jezik.general.error.netGreska + ": Unexpected response format")
                    setLoading(false);
                }
            } catch (err) {
                window.alert(jezik.general.error.netGreska + ": " + err.message)
                setLoading(false);
            }
        };
    
        fetchOglasi();
    }, []);

    const handleBrisanjeOglasa = async id => {
      const token = sessionStorage.getItem('jwt')
      try {
          const response = await fetch(`https://localhost:7080/Poslodavac/IzbrisatiOglas/${id}`, {
              method: 'DELETE',
              headers: {
                  Authorization: `bearer ${token}`
                }
          })
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

    if (loading) {
        return <div>{jezik.general.loading}...</div>;
    }
    return (
        <div className="container mx-auto p-2 bg-[#fff7ed]">
          <h1 className="text-2xl font-bold mb-4">Moji Oglasi</h1>
          <div className="grid grid-cols-1 gap-6">
            {oglasi.map((oglas) => (
              <div key={oglas.id} className="bg-[#ffedd5] p-6 rounded-lg shadow-md flex">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-4">{oglas.opis}</h2>
                  <p className="text-gray-700 mb-2">Cena po satu: {oglas.cenaPoSatu} EUR</p>
                  <p className="text-gray-700 mb-2">Datum postavljanja: {new Date(oglas.datumPostavljanja).toLocaleDateString()}</p>
                  <p className="text-gray-700 mb-4">Datum završetka: {new Date(oglas.datumZavrsetka).toLocaleDateString()}</p>
                </div>
                {oglas.listaSlika && oglas.listaSlika.length > 0 && (
                  <div className="flex flex-col justify-center">
                    <div className="flex flex-wrap">
                      {oglas.listaSlika.map((slika, index) => (
                        <img
                          key={index}
                          src={slika}
                          alt={`Slika ${index + 1}`}
                          className="w-32 h-32 object-cover mr-2 mb-2 rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {korisnik !== null && korisnik.tip === 'poslodavac' && (
                  <button onClick={() => handleBrisanjeOglasa(oglas.id)} className="bg-orange-400 text-white px-3 py-2 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    Delete oglas
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
}
