import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";
import { useNavigate } from "react-router-dom";
import Kalendar from "../komponente/Kalendar";
import ListaProfilaMajstora from "../komponente/ListaProfilaMajstora";

export default function StranicaProfil(props){
    const [profil, setProfil] = useState({})
    const [clanovi, setClanovi] = useState([])
    const [recenzije, setRecenzije] = useState([])
    const navigate = useNavigate()
    const korisnik = useContext(AppContext).korisnik
    const setGledaniKorisnik = useContext(AppContext).setGledaniKorisnik
    const jezik = useContext(AppContext).jezik

    useEffect(() => {
        if (props.profil !== null){
            sessionStorage.setItem('view', `${props.profil.id}`)
        }
        loadProfil()
    }, [])

    const loadProfil = async () => {
        const id = sessionStorage.getItem('view')
        try {
            let response = await fetch(`https://localhost:7080/Profil/vratiKorisnika/${id}`)
            if (response.ok){
                let data = await response.json()
                setProfil(data)
                if (data.tip === 'majstor' && data.tipMajstora === 'grupa'){
                    response = await fetch(`https://localhost:7080/Majstor/GetClanovi/${id}`)
                    if (response.ok){
                        data = await response.json()
                        setClanovi(data)
                    }
                    else {
                        window.alert(jezik.general.error.netGreska + ": " + await response.text())
                    }
                }
    
                response = await fetch(`https://localhost:7080/Osnovni/GetRecenzije/${id}`)
                if (response.ok){
                    data = await response.json()
                    setRecenzije(data)
                }
                else {
                    window.alert(jezik.general.error.netGreska + ": " + await response.text())
                }
            }
            else {
                window.alert(jezik.general.error.netGreska + ": " + await response.text())
            }
        } catch (error) {
            window.alert(jezik.general.netGreska + ": " + error.message)
        }
    }

    const handleMajstorZahtevPosao = () => {
        setGledaniKorisnik(profil)
        navigate('../create_job_request')
    }

    const handleMajstorZahtevGrupa = () => {
        setGledaniKorisnik(profil)
        navigate('../create_group_request')
    }

    const handleAdminIzbrisiProfil = async () => {
        const token = sessionStorage.getItem('jwt')
        const id = sessionStorage.getItem('view')
        try {
            const response = await fetch(`https://localhost:7080/Profil/izbrisiProfil/${id}`, {
                method: "DELETE",
                headers: {
                  'Content-Type': "application/json",
                  Authorization: `Bearer ${token}`
                }
            })
            if (response.ok){
                navigate('../profile')
            }
            else {
                window.alert(jezik.general.error.netGreska + ": " + await response.text())
            }
        } catch (error) {
            window.alert(jezik.general.netGreska + ": " + error.message)
        }
    }

    return (
        <div className="p-4 relative">
            <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-lg shadow mx-auto mt-4 flex relative">
                <div className="flex flex-col items-center w-1/3 p-4">
                    <img className="w-48 h-48 mb-3 rounded-full shadow-lg" src={profil.slika || "/images/"} alt={jezik.header.profil} />
                    <h5 className="mb-1 text-2xl font-medium text-gray-900">{profil.username}</h5>
                    <span className="text-lg text-gray-500">{profil.tip}</span>
                </div>
                <div className="flex flex-col justify-center w-2/3 p-4 relative">
                
                    {profil.tip === 'majstor' ? (
                        <div className="text-left">
                            <p className="text-lg text-gray-600">{jezik.formaProfil.naziv}: {profil.naziv}</p>
                            <p className="text-lg text-gray-600">{jezik.formaProfil.opis}: {profil.opis}</p>
                            <p className="text-lg text-gray-600">{jezik.formaProfil.grad}: {profil.grad.city_ascii}, {profil.grad.country}</p>
                            <p className="text-lg text-gray-600">{jezik.formaProfil.vestine}: {profil.listaVestina.join(', ')}</p>
                            <p className="text-lg text-gray-600">Email: {profil.email}</p>
                        </div>
                    ) : (
                        <div className="text-left">
                            <p className="text-lg text-gray-600">{jezik.formaProfil.naziv}: {profil.naziv}</p>
                            <p className="text-lg text-gray-600">{jezik.formaProfil.opis}: {profil.opis}</p>
                            <p className="text-lg text-gray-600">{jezik.formaProfil.grad}: {profil.grad}</p>
                            <p className="text-lg text-gray-600">{jezik.formaProfil.adresa}: {profil.adresa}</p>
                            <p className="text-lg text-gray-600">Email: {profil.email}</p>
                        </div>
                    )}
                </div>
                {(korisnik !== null && korisnik.tip === 'poslodavac' && profil.tip === 'majstor') && (
                    <button onClick={handleMajstorZahtevPosao} className="absolute top-2 right-2 px-3 py-2 rounded-md bg-yellow-400 text-black hover:bg-yellow-300 transition-colors duration-300">{jezik.profil.zahtevPosao}</button>
                )}
                {(korisnik !== null && korisnik.tip === 'majstor' && profil.tip === 'majstor' && profil.id !== korisnik.id && profil.tipMajstora === 'majstor') && (
                    <button onClick={handleMajstorZahtevGrupa} className="absolute top-2 right-2 px-3 py-2 rounded-md bg-yellow-400 text-black hover:bg-yellow-300 transition-colors duration-300">{jezik.profil.zahtevGrupa}</button>
                )}
                {(korisnik !== null && korisnik.jeAdmin && profil.id !== korisnik.id) && (
                    <button onClick={handleAdminIzbrisiProfil} className="absolute bottom-0 right-2 px-3 py-2 rounded-md bg-yellow-400 text-black hover:bg-yellow-300 transition-colors duration-300">{jezik.profil.adminIzbrisi}</button>
                )}
            </div>
            {clanovi !== null && clanovi.length > 0 && (
                <ListaProfilaMajstora lista={clanovi} />
            )}
            {profil.tip === 'majstor' && (
                <Kalendar licniProfil={false} id={profil.id} />
            )}
            {(recenzije != null && recenzije.length != null && recenzije.length > 0) && recenzije.map((recenzija, index) => (
                <div key={index}>
                    recenzija
                </div>
            ))}
        </div>
    )
}