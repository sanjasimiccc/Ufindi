import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import jsPDF from 'jspdf'; //a library to generate PDFs in client-side JavaScript.

export default function ProfilUgovori() {
  const [ugovori, setUgovori] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const korisnik = useContext(AppContext).korisnik
  const setNaProfilu = useContext(AppContext).setNaProfilu
  const jezik = useContext(AppContext).jezik

  useEffect(() => {
    const fetchUgovori = async () => {
      const token = sessionStorage.getItem("jwt");
      try {
        const response = await fetch('https://localhost:7080/Korisnik/getUgovori', {
          headers: {
            Authorization: `bearer ${token}`
          }
        });
  
        if (!response.ok) {
          window.alert(jezik.general.error.netGreska + ": " + await response.text())
        }
        else {
          const data = await response.json();
          setUgovori(data)
        }
      } catch (error) {
        window.alert(jezik.general.error.netGreska + ": " + error.message)
      } finally {
        setLoading(false);
      }
    };
  
    fetchUgovori();
  }, []);

  const handleUgovorClick = (ugovor) => {
    setNaProfilu(false)
    navigate(`../ugovor`, { state: { ugovor } });
  };

  const downloadPDF = async (ugovor) => {
    const doc = new jsPDF();
    const options = {
      align: 'left',
      fontSize: 8,
      fontStyle: 'normal', 
    };
    const content = `
    Ugovor
    Strane ugovora:
    Izmedju ${ugovor.imePoslodavca} (u daljem tekstu: Poslodavac)
    i ${ugovor.imeMajstora}  (u daljem tekstu: Majstor).
    Predmet ugovora:
    Predmet ovog ugovora je pruzanje usluga od strane Majstora Poslodavcu
    na osnovu dogovora izmedju strana.
    Opis posla:
    ${ugovor.opis}
    Period izvrsenja usluga:
    Od ${new Date(ugovor.datumPocetka).toLocaleDateString()} do ${new Date(ugovor.datumZavrsetka).toLocaleDateString()}.
    Cena Po Satu:
    Dogovorena cena po satu iznosi ${ugovor.cenaPoSatu}.
    Trajanje ugovora:
    Ugovor stupa na snagu od trenutka potpisivanja i važi do dogovorenog 
    datuma završetka.
    Radno vreme i obaveze:
    Majstor se obavezuje da ce obavljati obaveze u skladu sa dogovorenim 
    radnim vremenom i pravilima Poslodavca. Radno vreme, raspored i obaveze
    bice detaljnije definisani u posebnom dokumentu o radu.
    Placanje:
    Poslodavac se obavezuje da ce isplatiti Majstoru dogovorenu cenu po satu 
    za obavljene usluge. Placanje ce se vrsiti na nacin i u rokovima
    dogovorenim izmedju strana.
    Odgovornost:
    Poslodavac i Majstor se obavezuju da ce obavljati svoje obaveze u skladu sa zakonima
    i propisima i da ce postovati medjusobne dogovore.
    Raskid ugovora:
    Ugovor može biti raskinut uz prethodnu saglasnost obe strane ili u skladu sa 
    zakonskim odredbama.
 `;

    doc.text(content, 10, 10, options);
  
    if (ugovor.potpisMajstor) {
      const potpisMajstoraImg = await loadImage(ugovor.potpisMajstor);
      doc.addImage(potpisMajstoraImg, 'JPEG', 10, 250, 50, 20);
      doc.text("Potpis Majstora", 10, 245);
    }
  
    if (ugovor.potpisPoslodavca) {
      const potpisPoslodavcaImg = await loadImage(ugovor.potpisPoslodavca);
      doc.addImage(potpisPoslodavcaImg, 'JPEG', doc.internal.pageSize.width - 60, 250, 50, 20);
      doc.text("Potpis Poslodavca", doc.internal.pageSize.width - 60, 245);
    }
  // Dodavanje watermark-a na različite pozicije na stranici
  const watermark = 'ufindi';
  const watermarkFontSize = 12; // Veličina fonta za watermark
  const watermarkColor = 200; // Boja fonta za watermark

  doc.setFontSize(watermarkFontSize);
  doc.setTextColor(watermarkColor);

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const watermarkXIncrement = 50; // Inkrement za X poziciju
  const watermarkYIncrement = 50; // Inkrement za Y poziciju

  let xPosition = 10; // Inicijalna X pozicija
  let yPosition = 10; // Inicijalna Y pozicija

  while (yPosition < pageHeight) {
    doc.text(watermark, xPosition, yPosition);
    xPosition += watermarkXIncrement;

    if (xPosition > pageWidth) {
      xPosition = 10;
      yPosition += watermarkYIncrement;
    }
  }
  
  
    doc.save(`ugovor_${ugovor.id}.pdf`);
  };

  const loadImage = (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => resolve(img);
    });
  };

  const handleAddRecenzija = (uID, kID1, kID2) => {
    sessionStorage.setItem('uID', `${uID}`)
    if (korisnik.tip === 'majstor'){
      sessionStorage.setItem('kID', `${kID2}`)
    }
    else {
      sessionStorage.setItem('kID', `${kID1}`)
    }
    setNaProfilu(false)
    navigate('/add_review')
  }

  const handleRaskini = async id => {
    const token = sessionStorage.getItem('jwt')
    try {
      const response = await fetch(`https://localhost:7080/Korisnik/raskiniUgovor?idUgovora=${id}`, {
        method: 'PUT',
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

  const handleZavrsenPosao = async (uspeh, id) => {
    const token = sessionStorage.getItem('jwt')
    try {
      const response = await fetch(`https://localhost:7080/Poslodavac/zavrsiPosao/${id}/${uspeh}`, {
        method: 'POST',
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
      <h2 className="text-2xl font-semibold mb-4">Ugovori</h2>
      {ugovori.length === 0 ? (
        <p className="text-gray-700">Nema pronađenih ugovora.</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-6">
            {ugovori.map(ugovor => {
              if (ugovor.status !== 'neuspesnoZavrsen' && ugovor.status !== 'uspesnoZavrsen'){
                return (
                  <li key={ugovor.id} className="bg-[#ffedd5] border p-4 mb-2 rounded cursor-pointer">
                    <h3 className="text-xl font-bold mb-2">{ugovor.status === 'potpisan' ? `${ugovor.imePoslodavca} - ${ugovor.imeMajstora}` : `${korisnik.naziv} - ${ugovor.imeZaPrikaz}`}</h3>
                    {ugovor.opis && <p className="text-gray-700 mb-2">{ugovor.opis}</p>}
                    <p className="text-gray-700 mb-2">Datum početka: {new Date(ugovor.datumPocetka).toLocaleDateString()}</p>
                    <p className="text-gray-700 mb-2">Datum završetka: {new Date(ugovor.datumZavrsetka).toLocaleDateString()}</p>
                    <p className="text-gray-700 mb-2">Cena po satu: {ugovor.cenaPoSatu}</p>
                    <p className="text-gray-700 mb-2">Status: {ugovor.status}</p>
                    <button onClick={() => downloadPDF(ugovor)} className="mt-2 bg-blue-500 text-white py-1 px-2 rounded">Download PDF</button>
                    {(ugovor.status === 'nepotpisan' || (ugovor.status === 'potpisaoMajstor' && korisnik.tip === 'poslodavac') || (korisnik.tip === 'majstor' && ugovor.status === 'potpisaoPoslodavac')) && (
                      <button className='flex space-x-2 px-4 py-2 rounded' onClick={() => handleUgovorClick(ugovor)}>Sign Contract</button>
                    )}
                    {(ugovor.status === 'potpisan' || ugovor.status === 'raskidaMajstor' || ugovor.status.status === 'raskidaPoslodavac') && (
                      <button className='flex space-x-2 px-4 py-2 rounded' onClick={() => handleAddRecenzija(ugovor.id, ugovor.majstorID, ugovor.poslodavacID)}>Add review</button>
                    )}
                    {(ugovor.status === 'potpisan' || (ugovor.status === 'raskidaMajstor' && korisnik.tip === 'poslodavac') || (korisnik.tip === 'majstor' && ugovor.status === 'raskidaPoslodavac')) && (
                      <button className='flex space-x-2 px-4 py-2 rounded' onClick={() => handleRaskini(ugovor.id)}>Terminate Contract</button>
                    )}
                    {(ugovor.status === 'potpisan' && korisnik.tip === 'poslodavac') && (
                      <>
                        <button className='flex space-x-2 px-4 py-2 rounded' onClick={() => handleZavrsenPosao(0, ugovor.majstorID)}>Job Failed</button>
                        <button className='flex space-x-2 px-4 py-2 rounded' onClick={() => handleZavrsenPosao(1, ugovor.majstorID)}>Job Successful</button>
                      </>
                    )}
                  </li>
                )
              }
            })}
          </ul>
          <ul className="grid grid-cols-1 gap-6">
          {ugovori.map(ugovor => {
              if (ugovor.status === 'neuspesnoZavrsen' || ugovor.status === 'uspesnoZavrsen'){
                return (
                  <li key={ugovor.id} className="border p-4 mb-2 rounded">
                    <h3 className="text-xl font-bold">{ugovor.imePoslodavca} - {ugovor.imeMajstora}</h3>
                    <p>{ugovor.opis}</p>
                    <p>Datum početka: {new Date(ugovor.datumPocetka).toLocaleDateString()}</p>
                    <p>Datum završetka: {new Date(ugovor.datumZavrsetka).toLocaleDateString()}</p>
                    <p>Cena po satu: {ugovor.cenaPoSatu}</p>
                    <p>Status: {ugovor.status}</p>
                  </li>
                )
              }
            })}
          </ul>
        </>
      )}
    </div>
  );
};