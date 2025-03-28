import { useContext } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AppContext } from "../App"

export default function ProfilMajstora(props){

    const navigate = useNavigate()
    const korisnik = useContext(AppContext).korisnik
    const setGledaniKorisnik = useContext(AppContext).setGledaniKorisnik
    const setOglas = useContext(AppContext).setOglas
    const location = useLocation()
    const jezik = useContext(AppContext).jezik

    const handleMajstorSelect = () => {
        setGledaniKorisnik(props.majstor)
        sessionStorage.setItem('view', `${props.majstor.id}`)
        navigate(`../view_profile`)
    }

    const handleMajstorZahtevPosao = () => {
        setGledaniKorisnik(props.majstor)
        sessionStorage.setItem('view', `${props.majstor.id}`)
        navigate('../create_job_request')
    }

    const handleSelectMajstorZaPosao = async () => {
        setOglas(props.oglas)
        sessionStorage.setItem('oglas', `${props.oglas.id}`)
        sessionStorage.setItem('view', `${props.majstor.id}`)
        navigate('../create_job_request')
    }

    const handleMajstorZahtevGrupa = async () => {
        setGledaniKorisnik(props.majstor)
        sessionStorage.setItem('view', `${props.majstor.id}`)
        navigate('../create_group_request')
    }

    const handleIzbaciIzGrupe = async () => {
        const token = sessionStorage.getItem('jwt')
        try {
            const response = await fetch(`https://localhost:7080/Majstor/IzbaciIzGrupe/${props.majstor.id}`, {
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

    return (
        <div className="border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer my-4 bg-[#fff7ed]">
            <div className="flex items-center">
                <img src={`${props.majstor.slika}`} alt="Slika majstora" className="w-16 h-16 rounded-full mr-4" />
                <div>
                    <h1 className="font-bold">{props.majstor.naziv}</h1>
                    <p>Grad: {props.majstor.grad.city_ascii}</p>
                    <p>Ocena: {props.majstor.prosecnaOcena}</p>
                    <p>Vestine: {props.majstor.listaVestina}</p>
                </div>
            </div>
            <div className="flex justify-end">
                <div className="flex items-center space-x-4">
                    <button onClick={handleMajstorSelect} className="flex-shrink-0 bg-orange-400 text-white px-3 py-2 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">View profile</button>
                    {(korisnik !== null && korisnik.tip === 'poslodavac' && location.pathname !== '/view_job_posting') && (
                        <button onClick={handleMajstorZahtevPosao} style={{ backgroundColor: '#22c55e' }} className="flex-shrink-0 text-white px-3 py-2 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Pošalji zahtev za posao</button>
                    )}
                    {(korisnik !== null && korisnik.tip === 'majstor' && props.majstor.id !== korisnik.id && props.majstor.tipMajstora === 'majstor') && (
                        <button onClick={handleMajstorZahtevGrupa} style={{ backgroundColor: '#22c55e' }} className="flex-shrink-0 text-white px-3 py-2 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Send Group Request</button>
                    )}
                    {(location.pathname === '/view_job_posting' && props.idPoslodavca !== null && props.idPoslodavca === korisnik.id) && (
                        <button onClick={handleSelectMajstorZaPosao} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors duration-300">Izaberi majstora</button>
                    )}
                    {(location.pathname === '/profile' && props.count > 2) && (
                        <button onClick={handleIzbaciIzGrupe} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors duration-300">Remove From Group</button>
                    )}
                </div>
            </div>
        </div>
    )
}