import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../App"

export default function FormaZahtevGrupa(props){

    const [inputs, setInputs] = useState('')
    const navigate = useNavigate()
    const jezik = useContext(AppContext).jezik

    const handleOpisChange = () => {
        const textOpis = document.getElementById("opis")
        setInputs(textOpis.value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (inputs === ''){
            window.alert(jezik.general.error.nepunaForma)
            return
        }

        const token = sessionStorage.getItem('jwt')
        const primalac = sessionStorage.getItem('view')
        const url = `https://localhost:7080/Majstor/napraviZahtevGrupa/` + primalac

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `bearer ${token}`
                },
                body: JSON.stringify(inputs)
            })
    
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

    return (
        <div className="bg-white bg-opacity-60 shadow-lg p-8 w-1/3">  
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col space-y-4"> 
                    <textarea
                        id="opis"
                        placeholder={jezik.formaGrupa.opis}
                        onChange={handleOpisChange}
                        className="p-3 border rounded"
                    />
                
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-3 hover:bg-blue-600"  
                    >
                        {jezik.formaGrupa.submit}
                    </button>
                </div>
            </form>
        </div>
    )
}