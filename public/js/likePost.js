import axios from 'axios'

export const likePost = async (id, operation) => {
    if(operation === 'like' || operation === 'unlike') {
        await axios.get(`/api/v1/posts/${id}/likes/${operation}`)
    }
}

export const likeComment = async (postId, commentId) => {
    await axios.get(`/api/v1/posts/${postId}/comments/${commentId}/like`)
}