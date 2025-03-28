import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";
import ListaProfilaMajstora from "../komponente/ListaProfilaMajstora";

export default function StranicaOglas(props){

    const [oglas, setOglas] = useState({slike: [], prijavljeni: []})
    const [poslodavac, setPoslodavac] = useState({})
    const [profili, setProfili] = useState([])
    const [korisnik, setKorisnik] = useState(null)
    const [loading, setLoading] = useState(true)
    const jezik = useContext(AppContext).jezik

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? oglas.slike.length - 1 : prevIndex - 1));
    };

    const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === oglas.slike.length - 1 ? 0 : prevIndex + 1));
    };

    useEffect(() => {
        if (props.oglas !== null){
            sessionStorage.setItem('oglas', `${props.oglas.idOglas}`)
        }
        loadOglas()
    }, [])

    const loadOglas = async () => {
        let korzaload = korisnik
        const token = sessionStorage.getItem('jwt')
        if (token !== null){
        try {
            const response = await fetch('https://localhost:7080/Profil/podaciRegistracije', {
                headers: {
                Authorization: `bearer ${token}`
                }
            })
            if (response.ok){
                korzaload = await response.json()
                setKorisnik(korzaload)
            }
            else {
            window.alert(await response.text())
            }
        } catch (error) {
            window.alert(error.message)
        }
        }
        const oglasId = sessionStorage.getItem('oglas')
        try {
            const response = await fetch(`https://localhost:7080/Osnovni/GetOglas/${oglasId}`)
            if (response.ok){
                const data = await response.json()
                setOglas(data)
                const response2 = await fetch(`https://localhost:7080/Profil/vratiKorisnika/${data.idKorisnik}`)
                if (response2.ok){
                    setPoslodavac(await response2.json())
                    if (data.prijavljeni !== null && korzaload !== null && data.idKorisnik === korzaload.id){
                        const prijavljeniMajstori = []
                         await data.prijavljeni.forEach(async id => {
                            const response3 = await fetch(`https://localhost:7080/Profil/vratiKorisnika/${id}`)
            
                            if (response3.ok){
                                let newMajstor = await response3.json()
                                newMajstor = {...newMajstor, ['id']: id}
                                prijavljeniMajstori.push(newMajstor)
                            }
                            else {
                                window.alert(jezik.general.error.netGreska + ": " + response3.body)
                            }
                        })
                        setProfili(prijavljeniMajstori)
                    }
                    setTimeout(() => {
                        setLoading(false)
                    }, 1000);
                }
                else {
                    window.alert(jezik.general.error.netGreska + ": " + response2.body)
                }
            }
            else {
                window.alert(jezik.general.error.netGreska + ": " + await response.text())
            }
        } catch (error) {
            window.alert(jezik.general.error.netGreska + ": " + error.message)
        }
    }

    const handlePrijava = async () => {
        const token = sessionStorage.getItem('jwt')
        try {
            const response = await fetch(`https://localhost:7080/Majstor/prijaviNaOglas?id=${oglas.id}`, {
                method: 'POST',
                headers: {
                    Authorization: `bearer ${token}`
                  }
            })
            if (response.ok){
                loadOglas()
            }
            else {
                window.alert(jezik.general.error.netGreska + ": " + await response.text())
            }
        } catch (error) {
            window.alert(jezik.general.error.netGreska + ": " + error.message)   
        }
    }

    const handleOdjava = async () => {
        const token = sessionStorage.getItem('jwt')
        try {
            const response = await fetch(`https://localhost:7080/Majstor/OdjaviSaOglasa/${oglas.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `bearer ${token}`
                  }
            })
            if (response.ok){
                loadOglas()
            }
            else {
                window.alert(jezik.general.error.netGreska + ": " + await response.text())
            }
        } catch (error) {
            window.alert(jezik.general.error.netGreska + ": " + error.message)
        }
    }

    if (loading){
        return <p>{jezik.general.loading}...</p>
    }

    return (
        <>
            <div className="flex flex-col items-center bg-[#ffedd5] min-h-screen p-4">  
                <div className="w-full max-w-4xl border border-gray-200 rounded-lg shadow mx-auto mt-4 flex flex-wrap bg-[#fff7ed]">
                    <div className="w-full md:w-1/2 p-4">
                        <div className="flex flex-col items-start">
                            <p className="text-lg text-gray-600 mb-2">{poslodavac.naziv}</p>
                            <p className="text-lg text-gray-600 mb-2">{oglas.opis}</p>
                            <p className="text-lg text-gray-600 mb-2">{oglas.datumZavrsetka}</p>
                            <p className="text-lg text-gray-600 mb-2">{oglas.cenaPoSatu}</p>
                        </div>
                        <div className="w-full md:w-1/2 p-4 flex justify-end items-center">
                            {/* Dugme unutar diva */}
                            <div onClick={(e) => e.stopPropagation()}></div>
                            {(korisnik !== null && korisnik.tip === 'majstor' && oglas.prijavljeni !== null && !oglas.prijavljeni.includes(korisnik.id)) && (
                                <button onClick={handlePrijava} className="flex-shrink-0 bg-green-400 text-white px-3 py-2 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">{jezik.oglas.prijavi}</button>
                            )}
                            {(korisnik !== null && korisnik.tip === 'majstor' && oglas.prijavljeni !== null && oglas.prijavljeni.includes(korisnik.id)) && (
                                <button onClick={handleOdjava} className="flex-shrink-0 bg-orange-400 text-white px-3 py-2 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">{jezik.oglas.odjavi}</button>
                            )}
                        </div>
                    </div>
                </div>
                {/* Druga kartica za prikaz slika */}
                <div className="w-full max-w-4xl rounded-lg shadow mx-auto mt-4">
                    <div className="p-4">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <img className="w-full h-auto p-2 shadow-lg" src={oglas.slike[currentImageIndex] || "/images/"} alt="slike"/>
                                <button className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-200 rounded-full p-2 opacity-50" onClick={handlePreviousImage}>
                                &lt;
                                </button>
                                <button className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-200 rounded-full p-2 opacity-50" onClick={handleNextImage}>
                                &gt;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {(profili !== null && profili.length > 0) && (
                <ListaProfilaMajstora lista={profili} idPoslodavca={oglas.idKorisnik} oglas={oglas}/>
            )}
        </>
    )
}