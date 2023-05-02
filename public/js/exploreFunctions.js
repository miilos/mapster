import axios from 'axios'

const urlHost = ''

export const search = async query => {
    const users = await axios.get(`${urlHost}/api/v1/users/search/${query}`)
    return users
}

export const getPostsFromFollowing = async () => {
    const posts = await axios.get(`${urlHost}/api/v1/posts/posts-from-following`)
    return posts
}

export const getLikedPosts = async () => {
    const posts = await axios.get(`${urlHost}/api/v1/likes/likedPosts`)
    return posts
}

export const getPeopleInArea = async () => {
    const people = await axios.get(`${urlHost}/api/v1/users/near`)
    return people
}

export const getPostsInArea = async () => {
    const posts = await axios.get(`${urlHost}/api/v1/posts/near`)
    return posts
}