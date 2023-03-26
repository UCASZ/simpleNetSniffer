async function stopListen() {
    try {
        const response = await fetch(`http://localhost:3001/stop`,{
            method: 'GET',
            cache: 'no-cache'
        })
        const userData = await response.json()
        return userData
    } catch (error) {
        console.error(error)
        return null
    }
}

export {stopListen}