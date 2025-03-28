import { useContext} from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../App"

export default function Oglas(props){
    const navigate = useNavigate()
    const korisnik = useContext(AppContext).korisnik
    const setOglas = useContext(AppContext).setOglas
    const jezik = useContext(AppContext).jezik

    const selectOglas = () => {
        setOglas(props.oglas)
        sessionStorage.setItem('oglas', props.oglas.idOglas)
        navigate('../view_job_posting')
    }

    const handlePrijava = async () => {
        const token = sessionStorage.getItem('jwt')
        try {
            const response = await fetch(`https://localhost:7080/Majstor/prijaviNaOglas?id=${props.oglas.idOglas}`, {
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

    const handleOdjava = async () => {
        const token = sessionStorage.getItem('jwt')
        try {
            const response = await fetch(`https://localhost:7080/Majstor/OdjaviSaOglasa/${props.oglas.idOglas}`, {
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
        <div>
        <div 
            onClick={selectOglas}
            className="border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer my-4 bg-[#fff7ed] flex justify-between">
            <div>
            <h2>{props.oglas.naslov}</h2>
            <p>{props.oglas.opis}</p>
            <p>Cena po satu: {props.oglas.cenaPoSatu} EUR</p>
            </div>
            {/* Dugme unutar diva */}
            <div onClick={(e) => e.stopPropagation()}>
            {korisnik !== null && korisnik.tip !== 'poslodavac' && props.oglas.prijavljeni !== null && !props.oglas.prijavljeni.includes(korisnik.id) && (
                <button onClick={handlePrijava} className="bg-green-400 text-white px-3 py-2 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Sign up
                </button>
            )}
            {korisnik !== null && korisnik.tip !== 'poslodavac' && props.oglas.prijavljeni !== null && props.oglas.prijavljeni.includes(korisnik.id) && (
                <button onClick={handleOdjava} className="bg-orange-400 text-white px-3 py-2 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Sign off
                </button>
            )}
            </div>
        </div>
        </div>
     );
}