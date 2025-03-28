import { useContext, useEffect, useState } from "react";
import ListaOglasa from "../komponente/ListaOglasa";
import { AppContext } from "../App";

export default function PregledOglasa(props){

    const [oglasi, setOglasi] = useState([])
    const [parametri, setParametri] = useState({sort: 'Ocena', minCenaPoSatu: -1, minOcenaPoslodavca: -1, idGrad: -1, reci: 'null'})
    const [isDropdownOpen, setDropdownOpen] = useState(false)
    const [vestine, setVestine] = useState([])
    const [gradovi, setGradovi] = useState([])
    const [stranicazaprgled, setStranicazaprgled] = useState(1);
    const [stranicazaprikaz, setStranicazaprikaz] = useState(1);
    const [kraj, setKraj] = useState(false);
    const jezik = useContext(AppContext).jezik

    const loadOglasi = async () => {
        const search = parametri.reci === '' ? 'null' : parametri.reci
        try {
            const response = await fetch(`https://localhost:7080/Osnovni/PregledOglasa/${parametri.sort}/${stranicazaprgled}?minCenaPoSatu=${parametri.minCenaPoSatu === "" ? -1 : parametri.minCenaPoSatu}&minOcenaPoslodavca=${parametri.minOcenaPoslodavca === "" ? -1 : parametri.minOcenaPoslodavca}&idGrad=${parametri.idGrad}&reci=${search}`, {
                method: "POST",
                headers: {'Content-Type': "application/json"},
                body: JSON.stringify(vestine)
            })
            if (response.ok){
                const data = await response.json()
                setOglasi(data.lista);
                setKraj(data.kraj);
                setStranicazaprikaz(stranicazaprgled);
            }
            else {
                window.alert(jezik.general.error.netGreska + ": " + await response.text())
            }
        } catch (error) {
            window.alert(jezik.general.error.netGreska + ": " + error.message)
        }
    }

    useEffect(() => {
        loadOglasi()
    }, [])

    const handleGradChange = async e => {
        if (e.target.value !== ""){
          try {
            const response = await fetch(`https://localhost:7080/Profil/GetGradovi?start=${e.target.value}`)
            if (response.ok){
                const data = await response.json()
                setGradovi(data)
            }
            else {
                window.alert(jezik.general.error.netGreska + ": " + await response.text())
            }
          } catch (error) {
            window.alert(jezik.general.error.netGreska + ": " + error.message)
          }
        }
    }

    const handleGradSelect = e => {
        setParametri({...parametri, [e.target.name]: e.target.value})
    }

    const handleSubmit = e => {
        e.preventDefault()
        if(stranicazaprgled !== 1){
            setStranicazaprgled(1);
        } else {
            loadOglasi();
        }
    }

    const handleParamChange = e => {
        setParametri({...parametri, [e.target.name]: e.target.value})
    }
    
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
        setVestine(newVestine)
    }

    const handleNextPage = () => {
        if (!kraj) {
            setStranicazaprgled(stranicazaprgled + 1);
        }
    };

    const handlePreviousPage = () => {
        if (stranicazaprgled > 1) {
            setStranicazaprgled(stranicazaprgled - 1);
        }
    };

    return (
        <div className="flex flex-col items-center bg-[#ffedd5] min-h-screen p-4">  
            <div className=" w-full sm:w-1/2 pt-5">
                <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-4 w-full pb-3">
                    <input name='reci' type='text' placeholder={jezik.pregledi.search} onChange={handleParamChange} className="flex-grow min-w-0 flex-basis-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                    <button type="submit" className="flex-shrink-0 bg-orange-400 text-white px-3 py-2 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">{jezik.pregledi.search}</button>
                    <div className="relative flex-shrink-0">
                        <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="bg-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">{jezik.pregledi.filters}</button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-10 p-4 bg-[#fafafa] border-2 border-zinc-200 rounded-lg divide-y-2 shadow-lg z-30 w-max">
                                <div>
                                    <p className="py-2">{jezik.pregledi.filter}</p>
                                    <div className="flex-col sm:flex-row py-2">
                                        <label className="w-1/2 text-right px-3">{jezik.pregledi.minPlata}: </label>
                                        <input id="cena" name="minCenaPoSatu" type="number" placeholder={jezik.pregledi.minPlata} onChange={handleParamChange} className="px-3 py-1"/>
                                    </div>
                                    <div className="flex-col sm:flex-row py-2">
                                        <label className="w-1/2 text-right px-3">{jezik.pregledi.minPOcena}: </label>
                                        <input id="ocena" name="minOcenaPoslodavca" type="number" placeholder={jezik.pregledi.minPOcena} min={1} max={5} step={0.5} onChange={handleParamChange} className="px-3 py-1"/>
                                    </div>

                                    <div className="flex space-x-4 py-2"> 
                                        <input
                                            type="checkbox"
                                            value="stolar"
                                            className="vestine"
                                            onChange={handleVestineChange}
                                        />
                                        <label htmlFor="stolar">{jezik.formaProfil.stolar}</label>
                                        <input
                                            type="checkbox"
                                            value="elektricar"
                                            className="vestine"
                                            onChange={handleVestineChange}
                                        />
                                        <label htmlFor="elektricar">{jezik.formaProfil.elektricar}</label>
                                        <input
                                            type="checkbox"
                                            value="vodoinstalater"
                                            className="vestine"
                                            onChange={handleVestineChange}
                                        />
                                        <label htmlFor="vodoinstalater">{jezik.formaProfil.vodoinstalater}</label>
                                        <input
                                            type="checkbox"
                                            value="keramicar"
                                            className="vestine"
                                            onChange={handleVestineChange}
                                        />
                                        <label htmlFor="keramicar">{jezik.formaProfil.keramicar}</label>
                                    </div>
                                    
                                    <div className="py-2">
                                        <input
                                            name="drugo"
                                            type="text"
                                            placeholder={jezik.formaProfil.drugo}
                                            id="drugo"
                                            onChange={handleVestineChange}
                                            className="px-3 py-1 border rounded text-start justify-self-start"
                                        />
                                    </div>

                                    <div className="flex-col sm:flex-row py-2">
                                        <input type="text" onChange={handleGradChange} placeholder={jezik.formaProfil.grad} className="w-1/2 px-3 py-1"></input>
                                        <select name="idGrad" onChange={handleGradSelect} className="w-1/2 px-3 py-1">
                                            <option value={-1}>None</option>
                                            {gradovi.map(grad => (
                                                <option key={grad.id} value={grad.id}>{grad.city_ascii}, {grad.country}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <p className="py-2">{jezik.pregledi.sort}</p>
                                    <div className="py-2">
                                        <input type="radio" name="sort" value={'Ocena'} onClick={handleParamChange} defaultChecked></input><label className="pe-6">{jezik.pregledi.ocena}</label>
                                        <input type="radio" name="sort" value={'Cena po satu'} onClick={handleParamChange}></input><label>{jezik.pregledi.plata}</label>
                                    </div>
                                </div>
                            </div>    
                        )}
                    </div>
                </form>
                {(oglasi !== null && oglasi.length > 0) && (
                <ListaOglasa lista={oglasi}></ListaOglasa>
            )}
            <div className="flex justify-between mt-4">
                <button
                    onClick={handlePreviousPage}
                    className="bg-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    disabled={stranicazaprgled === 1}
                    >
                    Previous
                </button>
                <span>Page {stranicazaprikaz}</span>
                <button
                    onClick={handleNextPage}
                    className="bg-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    disabled={kraj}
                >
                    Next
                </button>
            </div>
        </div>
    </div>
  )
}