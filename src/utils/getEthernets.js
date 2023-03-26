async function getEthernets() {
    try {
        const response = await fetch(`http://localhost:3001/ethernets`)
        const userData = await response.json()
        return userData
    } catch (error) {
        console.error(error)
        return null
    }
}

export {getEthernets}