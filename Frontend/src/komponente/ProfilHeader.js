import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
//import { IoMdNotificationsOutline, IoMdSearch } from 'react-icons/io'; 

export default function ProfilHeader() {
  const { korisnik, setKorisnik, setNaProfilu } = useContext(AppContext);
  const navigate = useNavigate();

  const [isMenuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [jezikDDown, setJezikDDOwn] = useState(false)
  const jezik = useContext(AppContext).jezik
  const jezikID = useContext(AppContext).jezikID
  const setJezikID = useContext(AppContext).setJezikID
  const [jezici, setJezici] = useState([{id: 'en', name: 'English'}, {id: 'sr', name: 'Srpski'}])
  const setLogovan = useContext(AppContext).setLogovan

  const toggleJezikDDown = () => {
    setJezikDDOwn(!jezikDDown)
  }

  const handleJezikChange = id => {
    setJezikDDOwn(false)
    setJezikID(id)
  }

  const handleMenuDropdownToggle = () => {
    setMenuDropdownOpen(!isMenuDropdownOpen);
  };

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
    setIsDeleteConfirmOpen(false)
  };

  const handleLogoutConfirm = async () => {
    try {
      const response = await fetch('https://localhost:7080/Profil/logout', {
        method: 'POST',
        headers: {'Content-Type': "application/json"},
        credentials: 'include'
      });
      
      if (response.ok) {
        sessionStorage.removeItem('jwt');
        setKorisnik(null);
        setNaProfilu(false);
        setMenuDropdownOpen(false);
        setLogoutConfirmOpen(false);
        setLogovan(false)
        navigate('/');
      } else {
        console.error(jezik.general.error.netGreska + ": " + await response.text());
      }
    } catch (error) {
      console.error(jezik.general.error.netGreska + ": " + error.message);
    }
  };

  const handleLogoutCancel = () => {
    setLogoutConfirmOpen(false);
  };

  const handleDeleteClick = () => {
    setLogoutConfirmOpen(false)
    setIsDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    const token = sessionStorage.getItem('jwt');
    try {
      const response = await fetch('https://localhost:7080/Profil/izbrisiProfil', {
        method: 'DELETE',
        headers: {
          'Content-Type': "application/json",
          Authorization: `bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        sessionStorage.removeItem('jwt');
        setKorisnik(null);
        setNaProfilu(false);
        setMenuDropdownOpen(false);
        setLogoutConfirmOpen(false);
        setLogovan(false)
        navigate('/');
      } else {
        window.alert(jezik.general.error.netGreska + ": " + await response.text());
      }
    } catch (error) {
      console.error(jezik.general.error.netGreska + ": " + error.message);
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false)
  }

  return (
    <div className="flex justify-between items-center h-14 bg-gradient-to-r from-amber-600 to-amber-800 text-zinc-700 p-4 font-sans relative z-20">
      <div className="flex items-center space-x-4">
        <Link to="/" className="font-bold text-white hover:text-zinc-700 p-4" onClick={() => setNaProfilu(false)}>UFINDI</Link>
        <Link to="/search_craftsmen" className="font-bold text-white hover:text-zinc-700 p-4" onClick={() => setNaProfilu(false)}>{jezik.pocetna.pregledMajstora}</Link>
        <Link to="/search_job_postings" className="font-bold text-white hover:text-zinc-700 p-4" onClick={() => setNaProfilu(false)}>{jezik.pocetna.pregledOglasa}</Link>
        {korisnik !== null && korisnik.tip === 'poslodavac' && (
          <Link to='/create_job_posting' className="font-bold text-white hover:text-zinc-700 p-4" onClick={() => setNaProfilu(false)}>{jezik.profilHeader.napraviOglas}</Link>
        )}
      </div>
      
      <div className="relative">
        <button onClick={toggleJezikDDown} className="text-white hover:text-zinc-700 pe-5 justify-end">{jezikID.toUpperCase()}</button>
        {jezikDDown && (
          <div
            onClick={() => setMenuDropdownOpen(false)}
            className="absolute right-0 mt-2 w-max bg-yellow-700 bg-opacity-50 rounded-lg shadow-lg z-30"
          >
            {jezici.map(jezik => (
              <button key={jezik.id} onClick={() => handleJezikChange(jezik.id)} className="block px-4 py-2 text-white hover:bg-yellow-600 rounded w-full">{jezik.name}</button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 relative"> 
        <button onClick={handleMenuDropdownToggle} className="text-white hover:text-zinc-700 pe-5">{jezik.profilHeader.menu}</button>

        {/* <button onClick={handleNotificationDropdownToggle} className="relative text-white">
          {/*<IoMdNotificationsOutline size={24} />} 
          {isNotificationDropdownOpen && (
            <div className="absolute top-10 right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-30"> 
              <ProfilZahteviPosao />
            </div>
          )}
        </button> */}

        {isMenuDropdownOpen && (
          <div className="absolute top-10 right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-30"> 
            <Link to="/edit-profile" className="block px-4 py-2 text-black hover:bg-gray-200">{jezik.profilHeader.edit}</Link>
            <button onClick={handleLogoutClick} className="block w-full px-4 py-2 text-left text-black hover:bg-gray-200">{jezik.profilHeader.logout}</button>
            <button onClick={handleDeleteClick} className="block w-full px-4 py-2 text-left text-black hover:bg-gray-200">{jezik.profilHeader.delete}</button>
          </div>
        )}

        {isLogoutConfirmOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <p className="mb-4">{jezik.profilHeader.confirmLogout}</p>
              <div className="flex justify-end space-x-4">
              <button onClick={handleLogoutConfirm} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">{jezik.general.yes}</button>
              <button onClick={handleLogoutCancel} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">{jezik.general.no}</button>
              </div>
            </div>
          </div>
        )}

        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <p className="mb-4">{jezik.profilHeader.confirmDelete}</p>
              <div className="flex justify-end space-x-4">
              <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">{jezik.general.yes}</button>
              <button onClick={handleDeleteCancel} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">{jezik.general.no}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
