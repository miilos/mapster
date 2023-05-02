import axios from 'axios'

export const handleFollowAction = async (id, action) => {
    await axios.get(`/api/v1/users/${id}/${action}`)
}