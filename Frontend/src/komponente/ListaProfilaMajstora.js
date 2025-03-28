import { memo, useContext, useEffect, useState } from "react";
import ProfilMajstora from "./ProfilMajstora";
import { AppContext } from "../App";

function ListaProfilaMajstora(props){
    const [clanovi, setClanovi] = useState(props.lista)
    const jezik = useContext(AppContext).jezik

    useEffect(() => {
        if (clanovi === null){
            loadClanovi()
        }
    }, [])

    const loadClanovi = async () => {
        try {
            const response = await fetch(`https://localhost:7080/Majstor/GetClanovi/${props.id}`)
            if (response.ok){
                const data = await response.json()
                setClanovi(data)
            }
            else {
                window.alert(jezik.general.error.netGreska + ": " + await response.text())
            }
        } catch (error) {
            window.alert(jezik.general.error.netGreska + ": " + error.message)
        }
    }

    if (clanovi === null){
        return <p>{jezik.general.loading}...</p>
    }

    return clanovi.map((profil, index) => (
        <ProfilMajstora key={index} majstor={profil} idPoslodavca={props.idPoslodavca} oglas={props.oglas} count={clanovi.length}></ProfilMajstora>
    ))
}

export default memo(ListaProfilaMajstora)