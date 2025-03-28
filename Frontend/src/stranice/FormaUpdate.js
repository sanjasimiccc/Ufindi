
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from "../App";

export default function FormaUpdate() {
  const [formData, setFormData] = useState({
    naziv: '',
    adresa: '',
    slika: '',
    opis: '',
    gradID: '',
    email: '',
    vestine: []
  });
  //const [vestine, setVestine] = useState([]);
  const [gradovi, setGradovi] = useState([]);
  const [grad, setGrad] = useState(null);
  const navigate = useNavigate();
  const { korisnik, setKorisnik } = useContext(AppContext);
  const [vestineChecked, setVestineChecked]= useState();
  const jezik = useContext(AppContext).jezik

  useEffect(() => {
    if (korisnik) {
      setFormData({
        naziv: korisnik.naziv || '',
        adresa: korisnik.adresa || '',
        slika: korisnik.slika || '',
        opis: korisnik.opis || '',
        gradID: korisnik.gradID || '',
        email: korisnik.email || '',
        vestine: korisnik.listaVestina || []
      });
      setGrad(korisnik.gradID)
      const newVestineChecked = { ...vestineChecked };
      korisnik.listaVestina.forEach(vestina => {
        newVestineChecked[vestina] = true;
      });
      setVestineChecked(newVestineChecked);
    }
  }, [korisnik]);

  const handleGradChange = async (e) => {
    if (e.target.value !== "") {
      try {
        const response = await fetch(
          `https://localhost:7080/Profil/GetGradovi?start=${e.target.value}`
        );
        if (response.ok){
          const data = await response.json();
          const gradoviArray = data || [];
          if (Array.isArray(gradoviArray)) {
            setGradovi(gradoviArray);
            setGrad(gradoviArray[0]?.id || null);
          } else {
            setGradovi([]);
          }
        }
        else {
          window.alert(jezik.general.error.netGreska + ": " + await response.text())
        }
      } catch (error) {
        window.alert(jezik.general.error.netGreska + ": " + error.message)
        setGradovi([]);
      }
    }
  };

  const handleGradSelect = (e) => {
    setGrad(e.target.value);
  };

  const handleImageChange = (e) => {
    const img = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prevState => ({ ...prevState, slika: reader.result }));
    };
    reader.readAsDataURL(img);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleVestineChange = () => {
    const vestineBoxes = document.querySelectorAll(".vestine")
    let newVestine = []
    vestineBoxes.forEach(v => {
        if (v.checked){
            newVestine.push(v.value)
        }
    })
    const drugeVestine = document.getElementById("drugo").value.split(", ")
    drugeVestine.forEach((v) => {
        if (v.length >= 2){
            newVestine.push(v)
        }
    })
    setFormData({...formData, vestine: newVestine})
}

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("jwt");

    const url = korisnik.tip === "poslodavac"
      ? 'https://localhost:7080/Poslodavac/AzurirajPoslodavac2'
      : 'https://localhost:7080/Majstor/AzurirajMajstor2';

    const requestBody = {
      username: '',
      password: '',
      naziv: formData.naziv,
      slika: formData.slika,
      opis: formData.opis,
      gradID: grad,
      adresa: korisnik.tip === "poslodavac" ? formData.adresa : null,
      email: '',
      listaVestina: formData.vestine,
      tip: korisnik.tip,
      tipMajstora: korisnik.tip === "majstor" ? korisnik.tipMajstora : null,
      povezani: korisnik.povezani
    };

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        setKorisnik({ ...korisnik, ...formData, listaVestina: formData.vestine });
        navigate("../profile");
      } else {
        window.alert(jezik.general.error.badRequest)
      }
    } catch (error) {
      window.alert(jezik.general.error.netGreska + ": " + error.message)
    }
  };

  if (!korisnik) {
    return <div>{jezik.general.loading}...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Update Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-gray-700">Naziv:</span>
          <input type="text" name="naziv" value={formData.naziv} onChange={handleInputChange} className="form-input mt-1 block w-full" />
        </label>
        {korisnik.tip === "poslodavac" && (
          <label className="block">
            <span className="text-gray-700">Adresa:</span>
            <input type="text" name="adresa" value={formData.adresa} onChange={handleInputChange} className="form-input mt-1 block w-full" />
          </label>
        )}
        <label className="block">
        <span className="text-gray-700">Slika:</span>
          {formData.slika && (
            <div className="mb-2">
              <img src={formData.slika} alt="Trenutna slika" className="h-20 w-20 object-cover rounded-full" />
            </div>
          )}
          <input
            id="pfp"
            type="file"
            accept=".jpg, .jpeg, .png"
            onChange={handleImageChange}
            className="p-3 border rounded"
          />
        </label>
        <label className="block">
        <span className="text-gray-700">Opis:</span>
          <textarea
            name="opis"
            value={formData.opis}
            onChange={handleInputChange}
            className="form-textarea mt-1 block w-full"
          ></textarea>
        </label>
        <label className="block">
          <span className="text-gray-700">Grad:</span>
          <input type="text" onChange={handleGradChange} placeholder="City" className="p-3 border rounded"></input>
          <select name="grad" onChange={handleGradSelect}>
            <option value={korisnik.gradID}>{korisnik.city_ascii}, {korisnik.country}</option>
            {gradovi.map(grad => (
              <option key={grad.id} value={grad.id}>{grad.city_ascii}, {grad.country}</option>
            ))}
          </select>
        </label>
       
        {korisnik.tip === "majstor" && (
          <div className="block">
            <span className="text-gray-700">{jezik.formaProfil.vestine}:</span>
            <div className="flex space-x-4"> 
                    <input
                      type="checkbox"
                      value="stolar"
                      className="vestine"
                      onChange={handleVestineChange}
                      checked={formData.vestine.includes("stolar")}
                    />
                    <label htmlFor="stolar">{jezik.formaProfil.stolar}</label>
                    <input
                      type="checkbox"
                      value="elektricar"
                      className="vestine"
                      onChange={handleVestineChange}
                      checked={formData.vestine.includes("elektricar")}
                    />
                    <label htmlFor="elektricar">{jezik.formaProfil.elektricar}</label>
                    <input
                      type="checkbox"
                      value="vodoinstalater"
                      className="vestine"
                      onChange={handleVestineChange}
                      checked={formData.vestine.includes("vodoinstalater")}
                    />
                    <label htmlFor="vodoinstalater">{jezik.formaProfil.vodoinstalater}</label>
                    <input
                      type="checkbox"
                      value="keramicar"
                      className="vestine"
                      onChange={handleVestineChange}
                      checked={formData.vestine.includes("keramicar")}
                    />
                    <label htmlFor="keramicar">{jezik.formaProfil.keramicar}</label>
                  </div>
      
                  <input
                    name="drugo"
                    type="text"
                    placeholder={jezik.formaProfil.drugo}
                    id="drugo"
                    onChange={handleVestineChange}
                    className="p-3 border rounded"
                  />
          </div>
        )}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {jezik.general.submit}
        </button>
      </form>
    </div>
  );
}
