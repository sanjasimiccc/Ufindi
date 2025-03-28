import { useContext, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AppContext } from "../App"

export default function FormaProfil(props){

    const [inputs, setInputs] = useState({username: "", password: "", naziv: "", slika: "", opis: "", email: "", adresa: ""})
    const [vestine, setVestine] = useState([])
    const [gradovi, setGradovi] = useState([])
    const [grad, setGrad] = useState(null)
    const navigate = useNavigate()
    const [povezan, setPovezan] = useState(0)
    const setNaProfilu = useContext(AppContext).setNaProfilu
    const korisnik = useContext(AppContext).korisnik
    const setKorisnik = useContext(AppContext).setKorisnik
    const jezik = useContext(AppContext).jezik

    useEffect(() => {
      const p = sessionStorage.getItem('povezani')
      if (korisnik !== null){
        if (!props.grupa){
          setInputs(korisnik)
        }
        if (props.stanje !== 'login'){
          setGrad(document.getElementById('stdgrad').value)
        }
      }
      if (p !== null){
        setPovezan(Number.parseInt(p))
      }
      else {
        setPovezan(0)
      }
    }, [])

    const handleGradChange = async e => {
      if (e.target.value !== ""){
        try {
          let response = await fetch(`https://localhost:7080/Profil/GetGradovi?start=${e.target.value}`)
  
          if (response.ok){
            response = await response.json()
            setGradovi(response)
            if (response.length > 0 && povezan === 0){
              setGrad(response[0].id)
            }
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
      setGrad(e.target.value)
    }

    const handleSubmit = async e => {
        e.preventDefault()
        
        if (props.stanje === 'login'){
          if (inputs.username === "" || inputs.password === ""){
            window.alert(jezik.general.error.nepunaForma)
            return
          }
        }
        else if (props.tip === 'majstor'){
          if (inputs.username === "" || inputs.password === "" || inputs.naziv === "" || inputs.slika === "" || inputs.opis === "" || inputs.email === "" || vestine === null || grad === null){
            window.alert(jezik.general.error.nepunaForma)
            return
          }
        }
        else if (props.tip === 'poslodavac'){
          if (inputs.username === "" || inputs.password === "" || inputs.naziv === "" || inputs.slika === "" || inputs.opis === "" || inputs.email === "" || inputs.adresa === "" || inputs.adresa === "" || grad === null){
            window.alert(jezik.general.error.nepunaForma)
            return
          }
        }
        
        
        if (props.stanje === "login"){
          try {
            const response = await fetch('https://localhost:7080/Profil/login', {
                method: "POST",
                headers: {'Content-Type': "application/json"},
                credentials: 'include',
                body: JSON.stringify({
                    username: inputs.username,
                    password: inputs.password
                })
            })
  
            if (response.ok){
                setNaProfilu(true)
                const token= await response.text();
                sessionStorage.setItem("jwt", token);
                sessionStorage.removeItem('povezani')
                setKorisnik(null)
                navigate("../profile")
            }
            else{
              window.alert(jezik.general.error.badRequest)
            }
          } catch (error) {
            window.alert(jezik.general.error.netGreska + ": " + error.message)
          }
        }
        else if (props.tip === "majstor"){
          let response = null
          try {
            if (!props.grupa){
              response = await fetch('https://localhost:7080/Profil/register-majstor', {
                  method: "POST",
                  headers: {'Content-Type': "application/json"},
                  body: JSON.stringify({
                      username: inputs.username,
                      password: inputs.password,
                      tip: "majstor",
                      naziv: inputs.naziv,
                      slika: inputs.slika,
                      opis: inputs.opis,
                      gradID: grad,
                      email: inputs.email,
                      tipMajstora: "majstor",
                      listaVestina: vestine,
                      povezani: povezan
                  })
              })
            }
            else {
              const token = sessionStorage.getItem('jwt')
              response = await fetch(`https://localhost:7080/Profil/register-grupaMajstora`, {
                  method: "POST",
                  headers: {
                    'Content-Type': "application/json",
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                      username: inputs.username,
                      password: inputs.password,
                      tip: "majstor",
                      naziv: inputs.naziv,
                      slika: inputs.slika,
                      opis: inputs.opis,
                      gradID: grad,
                      email: inputs.email,
                      tipMajstora: "grupa",
                      listaVestina: vestine,
                      povezani: 0
                  })
              })
            }
  
            if (response.ok){
              sessionStorage.removeItem('povezani')
              navigate("../login")
            }
            else{
              window.alert(jezik.general.error.badRequest)
            }
          } catch (error) {
            window.alert(jezik.general.error.netGreska + ": " + error.message)
          }
        }
        else{
          try {
            const response = await fetch('https://localhost:7080/Profil/register-poslodavac', {
                method: "POST",
                headers: {'Content-Type': "application/json"},
                body: JSON.stringify({
                    username: inputs.username,
                    password: inputs.password,
                    tip: "poslodavac",
                    naziv: inputs.naziv,
                    slika: inputs.slika,
                    opis: inputs.opis,
                    gradID: grad,
                    adresa: inputs.adresa,
                    email: inputs.email,
                    povezani: povezan
                })
            })
  
            if (response.ok){
              sessionStorage.removeItem('povezani')
              navigate("../login")
            }
            else{
              window.alert(jezik.general.error.badRequest)
            }
          } catch (error) {
            window.alert(jezik.general.error.netGreska + ": " + error.message)
          }
        }
    }

    const handleInputChange = (e) => {
        setInputs({...inputs, [e.target.name]: e.target.value})
    }

    const handleImageChange = () => {
        const el = document.getElementById("pfp")
        const img = el.files[0]
        const reader = new FileReader()
        reader.onloadend = () => {
            setInputs({...inputs, ["slika"]: reader.result})
          }
        reader.readAsDataURL(img)
    }

    const handleOpisChange = () => {
        const textOpis = document.getElementById("opis")
        setInputs({...inputs, ["opis"]: textOpis.value})
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

    return (
      <div className="pozadina">
        <div className="bg-white bg-opacity-60 shadow-lg p-8 w-1/3 rounded-lg">  
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-4"> 
              <input
                name="username"
                type="text"
                placeholder={jezik.formaProfil.username}
                onChange={handleInputChange}
                className="p-3 border rounded-lg"  
              />
              <input
                name="password"
                type="password"
                placeholder={jezik.formaProfil.password}
                onChange={handleInputChange}
                className="p-3 border rounded-lg"  
              />
              
              {props.stanje === 'login' && (
                <>
                  <button
                    type="submit"
                    className="bg-yellow-700 bg-opacity-50 text-yellow-800 font-semibold border border-yellow-800 rounded-lg px-4 py-2 hover:bg-yellow-600 hover:border-yellow-700 hover:text-white transition-colors duration-300"  
                  >
                    {jezik.formaProfil.login}
                  </button>
                </>
              )}
              
              {props.stanje !== 'login' && (
                <>
                  <input
                    id="pfp"
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleImageChange}
                    className="p-3 border rounded"
                  />
                  <input
                    name="naziv"
                    type="text"
                    placeholder={jezik.formaProfil.naziv}
                    value={inputs.naziv}
                    onChange={handleInputChange}
                    className="p-3 border rounded"
                  />
                  <textarea
                    id="opis"
                    placeholder={jezik.formaProfil.opis}
                    value={inputs.opis}
                    onChange={handleOpisChange}
                    className="p-3 border rounded"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={inputs.email}
                    onChange={handleInputChange}
                    className="p-3 border rounded"
                  />

                  <input type="text" onChange={handleGradChange} placeholder={jezik.formaProfil.grad} className="p-3 border rounded"></input>
                  <select name="grad" onChange={handleGradSelect}>
                    {korisnik !== null && (
                      <option id="stdgrad" value={korisnik.gradID}>{korisnik.city_ascii}, {korisnik.country}</option>
                    )}
                    {gradovi.map(grad => (
                      <option key={grad.id} value={grad.id}>{grad.city_ascii}, {grad.country}</option>
                    ))}
                  </select>
                </>
              )}

              {props.tip === 'majstor' && (
                <>
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
                  
                  <button
                    type="submit"
                    className="bg-yellow-700 bg-opacity-50 text-yellow-800 font-semibold border border-yellow-800 rounded-lg px-4 py-2 hover:bg-yellow-600 hover:border-yellow-700 hover:text-white transition-colors duration-300"
                  >
                    {jezik.formaProfil.register}
                  </button>

                  <div className="text-center mt-4">  {/* Dodavanje razmaka i centriranja */}
                      <Link to="/login" className="text-blue-500 hover:underline">  {/* Link do stranice za prijavu */}
                          {jezik.formaProfil.loginPrompt}
                      </Link>
                  </div>
                </>
              )}

              {props.tip === 'poslodavac' && (
                <>
                  <input
                    name="adresa"
                    type="text"
                    placeholder={jezik.formaProfil.adresa}
                    onChange={handleInputChange}
                    className="p-3 border rounded"
                  />
                  
                  <button
                    type="submit"
                    className="bg-yellow-700 bg-opacity-50 text-yellow-800 font-semibold border border-yellow-800 rounded-lg px-4 py-2 hover:bg-yellow-600 hover:border-yellow-700 hover:text-white transition-colors duration-300"
                  >
                    {jezik.formaProfil.register}
                  </button>

                  <div className="text-center mt-4">  {/* Dodavanje razmaka i centriranja */}
                      <Link to="/login" className="text-blue-800 hover:underline">  {/* Link do stranice za prijavu */}
                          {jezik.formaProfil.loginPrompt}
                      </Link>
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    )
}