import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfilUgovori from '../komponente/ProfilUgovori';
import ProfilOglasi from '../komponente/ProfilOglasi';
import ProfilZahteviGrupa from '../komponente/ProfilZahteviGrupa';
import ProfilZahteviPosao from '../komponente/ProfilZahteviPosao';
import { AppContext } from "../App";
import Dropdown from '../komponente/Dropdown';
import Kalendar from '../komponente/Kalendar';
import ListaProfilaMajstora from '../komponente/ListaProfilaMajstora';

export default function Profil() {
  const { korisnik, setKorisnik } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  //const [error, setError] = useState(null);
  const [naProfilu, setNaProfilu] = useState(false);
  const [profileType, setProfileType] = useState(null);
  const [activeTab, setActiveTab] = useState('ugovori');
  const location = useLocation();
  const navigate = useNavigate();
  const setGlobalNaProfilu = useContext(AppContext).setNaProfilu
  const setOglas = useContext(AppContext).setOglas
  const jezik = useContext(AppContext).jezik
  const setLogovan = useContext(AppContext).setLogovan

  const transformListaVestina = (listaVestina) => {
    if (listaVestina && listaVestina.$values) {
      return listaVestina.$values;
    }
    return Array.isArray(listaVestina) ? listaVestina : [];
  };

  useEffect(() => {
    //ovo mi treba za oglase ne brini
    setOglas(null)
    sessionStorage.removeItem('oglas')
    sessionStorage.removeItem('povezani')

    // const fetchKorisnik = async () => {
    //   const token = sessionStorage.getItem("jwt");
    //   try {
    //     const response = await fetch('https://localhost:7080/Profil/podaciRegistracije', {
    //       headers: {
    //         Authorization: `bearer ${token}`
    //       }
    //     });

    //     if (!response.ok) {
    //       window.alert(jezik.general.error.netGreska + ": " + await response.text())
    //     }
    //     else {
    //       const data = await response.json();
  
    //       // Transform listaVestina before setting the state
    //       data.listaVestina = transformListaVestina(data.listaVestina);
  
    //       setKorisnik(data);
    //       if (data.tip === 'majstor') {
    //         setProfileType('poslodavac');
    //       } else {
    //         setProfileType('majstor');
    //       }
    //     }
    //   } catch (error) {
    //     window.alert(jezik.general.error.netGreska + ": " + error.message)
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchKorisnik();
    setGlobalNaProfilu(true)
    setLogovan(true)
    setLoading(false)
  }, [location.pathname, setKorisnik]);

  useEffect(() => {
    setNaProfilu(location.pathname === '/profile');
  }, [location.pathname, setNaProfilu]);

  const handleIzlazIzGrupe = async () => {
    const token = sessionStorage.getItem('jwt')
    try {
      const response = await fetch('https://localhost:7080/Majstor/izlazIzGrupe', {
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
    return <p>{jezik.general.loading}...</p>;
  }

  // if (error) {
  //   return <p>{error}</p>;
  // }

  if (!korisnik) {
    return <p>{jezik.stranicaProfil.nema}</p>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ugovori':
        return <ProfilUgovori />;
      case 'oglasi':
        return <ProfilOglasi />;
      case 'zahteviZaGrupu':
        return <ProfilZahteviGrupa />
      case 'zahteviZaPosao':
        return <ProfilZahteviPosao />;
      case 'kalendar':
        return <Kalendar licniProfil={true} id={korisnik.id}/>
      case 'clanovi':
        return <ListaProfilaMajstora lista={null} id={korisnik.id} />
      default:
        return null;
    }
  };

  return (
    <div className="p-4 relative">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-lg shadow mx-auto mt-4 flex">
        <div className="flex flex-col items-center w-1/3 p-4">
          <img className="w-48 h-48 mb-3 rounded-full shadow-lg" src={korisnik.slika || "/images/"} alt="Profile" />
          <h5 className="mb-1 text-2xl font-medium text-gray-900">{korisnik.username}</h5>
          <span className="text-lg text-gray-500">{korisnik.tip}</span>

        </div>
        <div className="flex flex-col justify-center w-2/3 p-4 relative">
          {(korisnik.tip === 'poslodavac' || korisnik.tipMajstora === 'majstor') && (
            <div className="absolute top-0 right-0 mt-2 mr-2">
              <Dropdown userType={korisnik.tip} />
            </div>
          )}
          {korisnik.tip === 'majstor' ? (
            <>
              <div className="text-left">
                <p className="text-lg text-gray-600">{jezik.formaProfil.naziv}: {korisnik.naziv}</p>
                <p className="text-lg text-gray-600">{jezik.formaProfil.opis}: {korisnik.opis}</p>
                <p className="text-lg text-gray-600">{jezik.formaProfil.grad}: {korisnik.city_ascii}, {korisnik.country}</p>
                <p className="text-lg text-gray-600">{jezik.formaProfil.vestine}: {korisnik.listaVestina.join(', ')}</p>
              </div>
              {korisnik.grupa === 1 && (
                <div className='absolute right-0 mr-2'>
                  <button onClick={handleIzlazIzGrupe}>Leave Group</button>
                </div>
              )}
            </>
          ) : (
            <div className="text-left">
              <p className="text-lg text-gray-600">{jezik.formaProfil.naziv}: {korisnik.naziv}</p>
              <p className="text-lg text-gray-600">{jezik.formaProfil.opis}: {korisnik.opis}</p>
              <p className="text-lg text-gray-600">{jezik.formaProfil.grad}: {korisnik.city_ascii}, {korisnik.country}</p>
              <p className="text-lg text-gray-600">{jezik.formaProfil.adresa}: {korisnik.adresa}</p>
            </div>
          )}
        </div>
      </div>
      {korisnik.tip === 'majstor' && (
        <div className="mt-4">
          <div className="flex justify-center space-x-4 mb-4">
            <button
              className={`px-4 py-2 rounded border  ${activeTab === 'ugovori' ? 'bg-yellow-700 bg-opacity-50 text-yellow-800 font-semibold border border-yellow-800 rounded-lg px-4 py-2' : 'border-yellow-600 hover:bg-yellow-600 hover:border-yellow-700 hover:text-white transition-colors duration-300'}`}
              onClick={() => setActiveTab('ugovori')}
            >
              {jezik.stranicaProfil.ugovori}
            </button>
            <button
              className={`px-4 py-2 rounded border  ${activeTab === 'oglasi' ? 'bg-yellow-700 bg-opacity-50 text-yellow-800 font-semibold border border-yellow-800 rounded-lg px-4 py-2' : 'border-yellow-600 hover:bg-yellow-600 hover:border-yellow-700 hover:text-white transition-colors duration-300'}`}
              onClick={() => setActiveTab('oglasi')}
            >
              {jezik.stranicaProfil.oglasi}
            </button>
            <button
              className={`px-4 py-2 rounded border  ${activeTab === 'zahteviZaPosao' ? 'bg-yellow-700 bg-opacity-50 text-yellow-800 font-semibold border border-yellow-800 rounded-lg px-4 py-2' : 'border-yellow-600 hover:bg-yellow-600 hover:border-yellow-700 hover:text-white transition-colors duration-300'}`}
              onClick={() => setActiveTab('zahteviZaPosao')}
            >
              {jezik.stranicaProfil.pzahtevi}
            </button>
            {korisnik.tipMajstora === 'grupa' && (
              <button
              className={`px-4 py-2 rounded border  ${activeTab === 'clanovi' ? 'bg-yellow-700 bg-opacity-50 text-yellow-800 font-semibold border border-yellow-800 rounded-lg px-4 py-2' : 'border-yellow-600 hover:bg-yellow-600 hover:border-yellow-700 hover:text-white transition-colors duration-300'}`}
                onClick={() => setActiveTab('clanovi')}
              >
                {jezik.stranicaProfil.clanovi}
              </button>  
            )}
            <button
              className={`px-4 py-2 rounded border  ${activeTab === 'zahteviZaGrupu' ? 'bg-yellow-700 bg-opacity-50 text-yellow-800 font-semibold border border-yellow-800 rounded-lg px-4 py-2' : 'border-yellow-600 hover:bg-yellow-600 hover:border-yellow-700 hover:text-white transition-colors duration-300'}`}
              onClick={() => setActiveTab('zahteviZaGrupu')}
            >
              {jezik.stranicaProfil.gzahtevi}
            </button>
            <button
              className={`px-4 py-2 rounded border  ${activeTab === 'kalendar' ? 'bg-yellow-700 bg-opacity-50 text-yellow-800 font-semibold border border-yellow-800 rounded-lg px-4 py-2' : 'border-yellow-600 hover:bg-yellow-600 hover:border-yellow-700 hover:text-white transition-colors duration-300'}`}
              onClick={() => setActiveTab('kalendar')}
            >
              {jezik.stranicaProfil.kalendar}
            </button>
          </div>
          <div className="rounded-lg">
            {renderTabContent()}
          </div>
        </div>
      )}
      {korisnik.tip === 'poslodavac' && (
        <div className="mt-4">
        <div className="flex justify-center space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded border ${activeTab === 'ugovori' ? 'bg-yellow-700 bg-opacity-50 text-yellow-800 font-semibold border border-yellow-800 rounded-lg px-4 py-2' : 'border-yellow-600 hover:bg-yellow-600 hover:border-yellow-700 hover:text-white transition-colors duration-300'}`}
            onClick={() => setActiveTab('ugovori')}
          >
            Ugovori
          </button>
          <button
            className={`px-4 py-2 rounded border ${activeTab === 'oglasi' ? 'bg-yellow-700 bg-opacity-50 text-yellow-800 font-semibold border border-yellow-800 rounded-lg px-4 py-2' : 'border-yellow-600 hover:bg-yellow-600 hover:border-yellow-700 hover:text-white transition-colors duration-300'}`}
            onClick={() => setActiveTab('oglasi')}
          >
            Postavljeni oglasi
          </button>
          <button
             className={`px-4 py-2 rounded border ${activeTab === 'zahteviZaPosao' ? 'bg-yellow-700 bg-opacity-50 text-yellow-800 font-semibold border border-yellow-800 rounded-lg px-4 py-2' : 'border-yellow-600 hover:bg-yellow-600 hover:border-yellow-700 hover:text-white transition-colors duration-300'}`}
              onClick={() => setActiveTab('zahteviZaPosao')}
          >
            Poslati zahtevi za posao
          </button>
        </div>
        <div>
          {renderTabContent()}
        </div>
      </div>
    )}
    </div>
  );
}