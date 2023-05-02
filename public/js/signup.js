import axios from 'axios';

const url = '/api/v1/users/signup'

export const signup = async(data) => {
    try {
        await axios.post(url, data)
        location.replace(`/home`)
    }
    catch(err) {
        console.log(err)
        let message = err.response.data.message

        if(message.startsWith('E11000'))
            message = 'That handle is already taken!'

        const password = data.password
        const passwordConfirm = data.passwordConfirm

        if(password.length < 8 && password !== passwordConfirm)
            message = 'Your password should be at least 8 characters long!'
        else if(password.length < 8)
            message = 'Your password should be at least 8 characters long!'
        else if(password !== passwordConfirm)
            message = 'Password and Confirm password have to match!'

        const errPanel = document.querySelector('.err')
        errPanel.style.display = 'block'
        
        const errText = document.querySelector('.err_text')
        errText.innerText = message
    }
}