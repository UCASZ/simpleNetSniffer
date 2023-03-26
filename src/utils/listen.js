async function listen(ethernet) {
    try {
        const response = await fetch(`http://localhost:3001/listening`,{
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: "ethernet="+ethernet
        })
        const userData = await response.json()
        return userData
    } catch (error) {
        console.error(error)
        return null
    }
}

export {listen}