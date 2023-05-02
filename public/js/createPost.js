import axios from 'axios'

export const createPost = async text => {
    try {
        await axios.post(`/api/v1/posts`, { 
            text 
        })

        location.replace(`/home`)
    }
    catch(err) {
        const errPanel = document.querySelector('.err')
        errPanel.style.display = 'block'
        
        const errText = document.querySelector('.err_text')
        errText.innerText = err.message || 'Something went wrong!'
    }
}

export const createComment = async (text, postId) => {
    try {
        await axios.post(`/api/v1/posts/${postId}/comments/comment`, {
            text,
            post: postId
        })
    }
    catch(err) {
        console.log(err)
    }
}