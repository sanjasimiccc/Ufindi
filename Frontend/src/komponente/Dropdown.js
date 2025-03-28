import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';

export default function Dropdown ({ userType }) {
  const navigate = useNavigate()
  const korisnik = useContext(AppContext).korisnik
  const setNaProfilu = useContext(AppContext).setNaProfilu
  const jezik = useContext(AppContext).jezik

  const handleDropdownItemClick = (tip, povezan) => {
    setNaProfilu(false)
    if (!povezan){
      sessionStorage.setItem('povezani', `${korisnik.id}`)
      navigate(tip === 'm' ? '../../register_employer' : '../../register_craftsman')
    }
    else {
      navigate('../login')
    }
  };

  return (
    <div className="top-10 right-0 mt-2 bg-white rounded-lg shadow-lg z-30">
      {korisnik.povezani === 0 ? 
        userType === 'majstor' ? (
          <button onClick={() => handleDropdownItemClick('m', false)} className="block px-4 py-2 text-black hover:bg-gray-200">{jezik.dropdown.rasp}</button>
        ) : (
          <button onClick={() => handleDropdownItemClick('p', false)} className="block px-4 py-2 text-black hover:bg-gray-200">{jezik.dropdown.rasm}</button>
        ) : 
        userType === 'majstor' ? (
          <button onClick={() => handleDropdownItemClick('m', true)} className="block px-4 py-2 text-black hover:bg-gray-200">{jezik.dropdown.switch}</button>
        ) : (
          <button onClick={() => handleDropdownItemClick('p', true)} className="block px-4 py-2 text-black hover:bg-gray-200">{jezik.dropdown.switch}</button>
        )
      }
    </div>
  );
};

