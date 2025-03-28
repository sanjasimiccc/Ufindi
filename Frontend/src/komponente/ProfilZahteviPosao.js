
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';

export default function ProfilZahteviPosao() {
  const [zahtevi, setZahtevi] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [error, setError] = useState(null);
  const navigate = useNavigate();
  const korisnik = useContext(AppContext).korisnik
  const jezik = useContext(AppContext).jezik

  useEffect(() => {
    const fetchZahtevi = async () => {
      const token = sessionStorage.getItem("jwt");
      try {
        const response = await fetch('https://localhost:7080/Korisnik/getZahteviPosaoMajstorGrupa', {
          headers: {
            Authorization: `bearer ${token}`
          }
        });

        if (!response.ok) {
          window.alert(jezik.general.error.netGreska + ": " + await response.text())
        }

        const data = await response.json();
        setZahtevi(data)   //setZahtevi(data["$values"]); meni nema ovo $values samo vrati niz normalno i sa ovim puca jer je undefined
        
      } catch (error) {
        window.alert(jezik.general.error.netGreska + ": " + error.message)
      } finally {
        setLoading(false);
      }
    };

    fetchZahtevi();
  }, []);

  const handleResponse = async (zahtevId, odgovor) => {
    const token = sessionStorage.getItem("jwt");
    try {
      const response = await fetch(`https://localhost:7080/Majstor/OdgovorZahtevPosao/${zahtevId}/${odgovor}`, {
        method: "GET",
        headers: {
          Authorization: `bearer ${token}`
        }
      });

      if (!response.ok) {
        window.alert(jezik.general.error.netGreska + ": " + await response.text())
      }
      else {
        window.location.reload()
      }
      // const data = await response.json();
      // console.log(data);
      // const ugovorId = data; // Dobijanje ID ugovora iz odgovora
      // console.log(ugovorId);

      // // Ako je zahtev prihvaćen, preusmeriti na stranicu za potpisivanje ugovora
      // if (odgovor === 'da') {
      //   const selectedZahtev = zahtevi.find(zahtev => zahtev.id === zahtevId);
      //   navigate('/ugovor', { state: { zahtev: selectedZahtev, ugovorID: ugovorId} });
      // } else {
      //   // Odbijen zahtev
      //   setZahtevi(zahtevi.filter(zahtev => zahtev.id !== zahtevId));
      // }

      // alert('Zahtev je uspešno obrađen!');
    } catch (error) {
      window.alert(jezik.general.error.netGreska + ": " + error.message)
    }
  };

  const handlePovuci = async id => {
    const token = sessionStorage.getItem('jwt')
    try {
      const response = await fetch(`https://localhost:7080/Poslodavac/povuciZahtevPosao/${id}`, {
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

  // if (error) {
  //   return <div>Error: {error}</div>;
  // }

  const handleChatClick = (drugaStranaID) => {
    let chatRoom;
    if(korisnik.tip== "majstor"){
     chatRoom = `${drugaStranaID}_${korisnik.id}`;
    }
    else if(korisnik.tip=="poslodavac"){
       chatRoom=  `${korisnik.id}_${drugaStranaID}`
    }
    navigate('/chat', { state: { chatRoom } });
  };

  return (
    <div>
      {zahtevi === null || zahtevi.length === null || zahtevi.length === 0 ? (
        <div className="text-black px-4 py-2 border-b hover:bg-gray-200">
          No job requests found.
        </div>
      ) : (
        <ul>
          {zahtevi.map((zahtev) => (
            <li
              key={zahtev.id}
              className="border p-4 mb-2 rounded hover:bg-gray-200 flex justify-between items-center"
              style={{ color: 'black' }}
            >
              <div>
                <h3 className="text-xl font-bold">Opis: {zahtev.opis || 'N/A'}</h3>
                <p>Cena po satu: {zahtev.cenaPoSatu || 'N/A'}</p>
                <p>Datum završetka: {zahtev.datumZavrsetka ? new Date(zahtev.datumZavrsetka).toLocaleDateString() : 'N/A'}</p>
                {korisnik.tip === 'majstor' && (
                  <p>Poslodavac: {zahtev.drugaStranaNaziv || 'N/A'}</p>
                )}
                {korisnik.tip === 'poslodavac' && (
                  <p>Majstor: {zahtev.drugaStranaNaziv || 'N/A'}</p>
                )}
              </div>
            <div className="flex space-x-2 items-center">
            <li key={zahtev.id}>
          <button onClick={() => handleChatClick(zahtev.drugaStranaID, korisnik.id)}>
            Chat 
          </button>
        </li>
              {korisnik.tip === 'majstor' && zahtev.prihvacen === 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleResponse(zahtev.id, 'da')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Prihvati
                  </button>
                  <button
                    onClick={() => handleResponse(zahtev.id, 'ne')}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Odbij
                  </button>
                </div>
              )}
              {korisnik.tip === 'poslodavac' && zahtev.prihvacen === 0 && (
                <div>
                  <button
                    onClick={() => handlePovuci(zahtev.id)}
                    className="px-4 py-2 rounded"
                  >
                    Povuci zahtev
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
  
  );
}
