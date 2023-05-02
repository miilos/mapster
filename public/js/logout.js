import axios from 'axios'

export const logout = async () => {
    await axios.post('/api/v1/users/logout', {}, { withCredentials: true })
    location.replace('/')
}