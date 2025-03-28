import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";

export default function FormaOglasZahtevPosao(props){
    const oglas = useContext(AppContext).oglas
    const [inputs, setInputs] = useState({naslov: '', opis: "", datumZavrsetka: "", cenaPoSatu: ""})
    const [curDate, setCurDate] = useState(new Date().toISOString().slice(0, 10))
    const [date, setDate] = useState(props.stanje === 'oglas' || (props.stanje === 'zahtev' && oglas === null) ? curDate : new Date(oglas.datumZavrsetka))
    const [images, setImages] = useState([])
    const [vestine, setVestine] = useState([])
    const setOglas = useContext(AppContext).setOglas
    const jezik = useContext(AppContext).jezik

    const navigate = useNavigate()

    useEffect(() => {
        document.getElementById('cenaPoSatu').addEventListener("keypress", function (e) {
            var allowedChars = '0123456789.'
            function contains(stringValue, charValue) {
                return stringValue.indexOf(charValue) > -1
            }
            var invalidKey = e.key.length === 1 && !contains(allowedChars, e.key)
                    || e.key === '.' && contains(e.target.value, '.')
            invalidKey && e.preventDefault()
        })
    })

    useEffect(() => {
        const oglasId = sessionStorage.getItem('oglas')
        if (props.stanje === 'zahtev' && oglasId !== null && oglasId !== ''){
            loadOglas()
        }
    }, [])

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

    const loadOglas = async () => {
        const oglasId = sessionStorage.getItem('oglas')
        try {
            const response = await fetch(`https://localhost:7080/Osnovni/GetOglas/${oglasId}`)
            if (response.ok){
                const data = await response.json()
                setOglas(data)
                setInputs({
                    opis: oglas.opis,
                    datumZavrsetka: oglas.datumZavrsetka,
                    cenaPoSatu: oglas.cenaPoSatu
                })
            }
            else {
                window.alert(jezik.general.error.netGreska + ": " + await response.text())
            }
        } catch (error) {
            window.alert(jezik.general.error.netGreska + ": " + error.message)
        }
    }

    const handleSubmit = async e => {
        e.preventDefault()

        if (props.stanje === 'oglas'){
            if (inputs.naslov === '' || inputs.opis === "" || inputs.datumZavrsetka === "" || inputs.cenaPoSatu === "" || vestine === null){
                window.alert(jezik.general.error.nepunaForma)
                return
            }
        }
        else if (props.stanje === 'zahtev'){
            if (inputs.opis === "" || inputs.datumZavrsetka === "" || inputs.cenaPoSatu === ""){
                window.alert(jezik.general.error.nepunaForma)
                return
            }
        }

        const token = sessionStorage.getItem('jwt')
        let response = null

        try {
            if (props.stanje === 'oglas'){
                response = await fetch('https://localhost:7080/Poslodavac/postaviOglas', {
                    method: "POST",
                    headers: {
                        'Content-Type': "application/json",
                        Authorization: `bearer ${token}`
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        naslov: inputs.naslov,
                        opis: inputs.opis,
                        cenaPoSatu: inputs.cenaPoSatu,
                        listaSlika: images,
                        datumZavrsetka: inputs.datumZavrsetka,
                        listaVestina: vestine
                    })
                })
            }
            else{
                const viewid = sessionStorage.getItem('view')
                response = await fetch('https://localhost:7080/Poslodavac/napraviZahtevPosao', {
                    method: "POST",
                    headers: {
                        'Content-Type': "application/json",
                        Authorization: `bearer ${token}`
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        opis: inputs.opis,
                        cenaPoSatu: inputs.cenaPoSatu,
                        listaSlika: images,
                        datumZavrsetka: inputs.datumZavrsetka,
                        korisnikID: viewid,
                        oglasID: oglas === null ? -1 : oglas.id
                    })
                })
            }
            
    
            if (response.ok){
                navigate('../profile')
            }
            else {
                window.alert(jezik.general.error.badRequest)
            }
        } catch (error) {
            window.alert(jezik.general.error.netGreska + ": " + error.message)
        }
    }

    const handleInputChange = e => {
        setInputs({...inputs, [e.target.name]: e.target.value})
    }

    const handleOpisChange = () => {
        const textOpis = document.getElementById("opis")
        setInputs({...inputs, ["opis"]: textOpis.value})
    }

    const handleDateChange = () => {
        const dateval = new Date(document.getElementById('date').value)
        setInputs({...inputs, ['datumZavrsetka']: dateval.toJSON()})
        setDate(dateval.toISOString().slice(0, 10))
    }

    const handleImageChange = async e => {
        const imgs = [...e.target.files]
        let newImgs = await Promise.all(imgs.map(img => {
            return processImg(img)
        }))
        setImages(newImgs)
    }

    const processImg = (image) => {
        return new Promise((resolve, reject) => {
			let fileReader = new FileReader()
			fileReader.onload = () => {
				return resolve(fileReader.result)
			}
			fileReader.readAsDataURL(image)
		})
    }

    return (
        <div className="pozadina">
            <div className="bg-white bg-opacity-80 shadow-lg p-8 w-1/3 rounded"> 
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col space-y-4">
                        {props.stanje === 'oglas' && (
                            <>
                                <input
                                    name="naslov"
                                    type="text"
                                    placeholder={jezik.formaProfil.naslov}
                                    onChange={handleInputChange}
                                    className="p-3 border rounded"
                                />
        
                                <div className="flex space-x-4"> 
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
                    
                                <input
                                    name="drugo"
                                    type="text"
                                    placeholder={jezik.formaProfil.drugo}
                                    id="drugo"
                                    onChange={handleVestineChange}
                                    className="p-3 border rounded"
                                />
                            </>
                        )}

                        
                        <textarea
                            id="opis"
                            value={inputs.opis}
                            placeholder={jezik.formaProfil.opis}
                            onChange={handleOpisChange}
                            className="p-3 border rounded"
                        />

                        <input
                            id="cenaPoSatu"
                            name="cenaPoSatu"
                            type="number"
                            value={inputs.cenaPoSatu}
                            step='0.01'
                            min={0}
                            placeholder={jezik.pregledi.plata}
                            onChange={handleInputChange}
                            className="p-3 border rounded"
                        />

                        <input
                            id="date"
                            type="date"
                            value={new Date(date)}
                            min={curDate}
                            onChange={handleDateChange}
                            className="p-3 border rounded"
                        />

                        <input
                          type="file"
                          accept=".jpg, .jpeg, .png"
                          multiple
                          onChange={handleImageChange}
                          className="p-3 border rounded"
                        />

                        <button type="submit" className="bg-blue-500 text-white p-3 hover:bg-blue-600">{jezik.general.submit}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}