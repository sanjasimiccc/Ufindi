import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../App"

export default function FormaRecenzija(props){

    const [inputs, setInputs] = useState({opis: "", ocena: 0})
    const [images, setImages] = useState([])
    const navigate = useNavigate()
    const jezik = useContext(AppContext).jezik

    useEffect(() => {
        document.getElementById('ocena').addEventListener("keypress", function (e) {
            var allowedChars = '12345'
            function contains(stringValue, charValue) {
                return stringValue.indexOf(charValue) > -1
            }
            var invalidKey = e.key.length === 1 && !contains(allowedChars, e.key)
                    || e.key === '.' && contains(e.target.value, '.')
            invalidKey && e.preventDefault()
        })
    })

    const handleOpisChange = () => {
        const textOpis = document.getElementById("opis")
        setInputs({...inputs, ['opis']: textOpis.value})
    }

    const handleInputChange = e => {
        setInputs({...inputs, [e.target.name]: e.target.value})
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

    const handleSubmit = async e => {
        e.preventDefault()

        if (inputs.opis === '' || inputs.ocena === 0){
            window.alert(jezik.general.error.nepunaForma)
            return
        }

        const token = sessionStorage.getItem('jwt')
        const idUgovor = sessionStorage.getItem('uID')
        const idPrimalac = sessionStorage.getItem('kID')
        try {
            const response = await fetch('https://localhost:7080/Korisnik/NapraviRecenziju', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `bearer ${token}`
                },
                body: JSON.stringify({
                    opis: inputs.opis,
                    ocena: inputs.ocena,
                    listaSlika: images,
                    idUgovor: idUgovor,
                    idPrimalac: idPrimalac
                })
            })
    
            if (response.ok){
                sessionStorage.removeItem('uID')
                sessionStorage.removeItem('kID')
                navigate('../profile')
            }
            else {
                window.alert(jezik.general.error.badRequest)
            }
        } catch (error) {
            window.alert(jezik.general.error.netGreska + ": " + error.message)
        }
    }

    return (
        <div className="bg-white bg-opacity-60 shadow-lg p-8 w-1/3">  
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col space-y-4"> 
                    <textarea
                        id="opis"
                        placeholder={jezik.formaRecenzija.opis}
                        onChange={handleOpisChange}
                        className="p-3 border rounded"
                    />

                    <input
                        id="ocena"
                        name="ocena"
                        type="number"
                        step='0.01'
                        placeholder={jezik.pregledi.ocena}
                        onChange={handleInputChange}
                        className="p-3 border rounded"
                    />

                    <input
                        type="file"
                        accept=".jpg, .jpeg, .png"
                        multiple
                        onChange={handleImageChange}
                        className="p-3 border rounded"
                    />
                
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-3 hover:bg-blue-600"  
                    >
                        {jezik.formaRecenzija.submit}
                    </button>
                </div>
            </form>
        </div>
    )
}