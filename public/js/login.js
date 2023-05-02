import axios from "axios"

const url = '/api/v1/users/login'

export const login = async (handle, password) => {
    try {
        const res = await axios.post(url, {
            handle,
            password
        })
        
        location.replace(`/home`)
    }
    catch(err) {
        document.getElementById('input-handle').value = ''
        document.getElementById('input-password').value = ''

        const errPanel = document.querySelector('.err')
        errPanel.style.display = 'block'
        
        const errText = document.querySelector('.err_text')
        errText.innerText = err.response.data.message
    }
}