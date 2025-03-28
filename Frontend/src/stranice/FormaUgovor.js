import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from "../App";

export default function UgovorForma() {
    const location = useLocation();
    const navigate = useNavigate();
    const { zahtev, ugovorID, ugovor } = location.state || {}; 
    const { korisnik } = useContext(AppContext); // Pristup kontekstu
    const userType = korisnik ? korisnik.tip : null; // Dobijanje tipa korisnika iz konteksta
    const jezik = useContext(AppContext).jezik

    const [inputs, setInputs] = useState({
        ID: zahtev ? ugovorID : ugovor ? ugovor.id : '',
        ImeMajstora: '',
        ImePoslodavca: '',
        CenaPoSatu: zahtev ? zahtev.cenaPoSatu || '' : '',
        Opis: '',
        DatumPocetka: '',
        DatumZavrsetka: '',
        MajstorID: zahtev ? zahtev.majstorID : ugovor ? ugovor.majstorID : '',
        PoslodavacID: zahtev ? zahtev.poslodavacID : ugovor ? ugovor.poslodavacID : '',
        ZahtevZaPosaoID: zahtev ? zahtev.id : ugovor ? ugovor.zahtevPosaoID : '',
        potpisMajstora: '',
        potpisPoslodavca: '',
        slika: ''
    });

    //const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs((prevInputs) => ({ ...prevInputs, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem("jwt");

        try {
            const response = await fetch('https://localhost:7080/Korisnik/potpisiUgovor', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `bearer ${token}`,
                },
                body: JSON.stringify({
                    ID: inputs.ID,
                    ImeMajstora: inputs.ImeMajstora,
                    ImePoslodavca: inputs.ImePoslodavca,
                    CenaPoSatu: parseFloat(inputs.CenaPoSatu),
                    Opis: inputs.Opis,
                    DatumPocetka: inputs.DatumPocetka,
                    DatumZavrsetka: inputs.DatumZavrsetka,
                    ZahtevZaPosaoID: inputs.ZahtevZaPosaoID,
                    MajstorID: inputs.MajstorID,
                    PoslodavacID: inputs.PoslodavacID,
                    potpisMajstora: inputs.potpisMajstora,
                    potpisPoslodavca: inputs.potpisPoslodavca,
                    slika: inputs.slika
                }),
            });

            if (!response.ok) {
                // const errorData = await response.json();
                // throw new Error(errorData.title || 'Network response was not ok');
                alert(jezik.general.error.badRequest);
            }
            else {
                //const data = await response.json();
                navigate('/profile');
            }
        } catch (error) {
            //setError(error.message);
            alert(jezik.general.error.netGreska + ": " + error.message);
        }
    };

    const handleImageChange = (e) => {
        const img = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            if (userType === 'majstor') {
                setInputs((prevInputs) => ({ ...prevInputs, potpisMajstora: reader.result }));
            } else {
                setInputs((prevInputs) => ({ ...prevInputs, potpisPoslodavca: reader.result }));
            }
        };
        reader.readAsDataURL(img);
    };

    return (
        <div className="flex justify-center items-center h-screen bg-orange-100 bg-opacity-50">
            <div className="bg-white bg-opacity-75 rounded-lg w-full max-w-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Potpisivanje Ugovora</h2>
                <form onSubmit={handleSubmit}>
                    {userType !== 'poslodavac' && (
                        <div className="mb-4">
                            <label htmlFor="ImeMajstora" className="block text-gray-700 font-bold mb-2">Ime Majstora</label>
                            <input
                                type="text"
                                id="ImeMajstora"
                                name="ImeMajstora"
                                value={inputs.ImeMajstora}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                    )}
                    {userType !== 'majstor' && (
                        <div className="mb-4">
                            <label htmlFor="ImePoslodavca" className="block text-gray-700 font-bold mb-2">Ime Poslodavca</label>
                            <input
                                type="text"
                                id="ImePoslodavca"
                                name="ImePoslodavca"
                                value={inputs.ImePoslodavca}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label htmlFor="CenaPoSatu" className="block text-gray-700 font-bold mb-2">Cena Po Satu</label>
                        <input
                            type="number"
                            id="CenaPoSatu"
                            name="CenaPoSatu"
                            value={inputs.CenaPoSatu}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="Opis" className="block text-gray-700 font-bold mb-2">Opis</label>
                        <textarea
                            id="Opis"
                            name="Opis"
                            value={inputs.Opis}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="DatumPocetka" className="block text-gray-700 font-bold mb-2">Datum Početka</label>
                        <input
                            type="date"
                            id="DatumPocetka"
                            name="DatumPocetka"
                            value={inputs.DatumPocetka}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="DatumZavrsetka" className="block text-gray-700 font-bold mb-2">Datum Završetka</label>
                        <input
                            type="date"
                            id="DatumZavrsetka"
                            name="DatumZavrsetka"
                            value={inputs.DatumZavrsetka}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="pfp" className="block text-gray-700 font-bold mb-2">
                            {userType === 'majstor' ? 'Potpis Majstora' : 'Potpis Poslodavca'}
                        </label>
                        <input
                            id="pfp"
                            type="file"
                            accept=".jpg, .jpeg, .png"
                            onChange={handleImageChange}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    {inputs.potpisMajstora && (
                        <div className="mb-4">
                            <img src={inputs.potpisMajstora} alt="Potpis Majstora" className="w-full h-auto" />
                        </div>
                    )}
                    {inputs.potpisPoslodavca && (
                        <div className="mb-4">
                            <img src={inputs.potpisPoslodavca} alt="Potpis Poslodavca" className="w-full h-auto" />
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-yellow-700 bg-opacity-50 text-yellow-800 font-semibold border border-yellow-800 rounded-lg px-4 py-2 hover:bg-yellow-600 hover:border-yellow-700 hover:text-white transition-colors duration-300"
                        >
                            Potpiši Ugovor
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
