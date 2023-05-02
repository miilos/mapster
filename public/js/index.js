import { login } from './login'
import { signup } from './signup'
import { createPost, createComment } from './createPost'
import { likePost, likeComment } from './likePost'
import { search, getPostsFromFollowing, getLikedPosts, getPeopleInArea, getPostsInArea } from './exploreFunctions'
import { handleFollowAction } from './follows'
import { logout } from './logout'
import map from './mapbox'

// LOGIN

const loginForm = document.querySelector('.login')

if(loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault()
        const handle = document.getElementById('input-handle').value
        const password = document.getElementById('input-password').value
        login(handle, password)
    })
}

// SIGNUP

if(document.getElementById('map')) {
    const signupForm = document.querySelector('.signup__form')
    const { lat, lng } = map.getCenter()
/* 
    map.on('move', () => console.log(map.getCenter()))
    console.log(map.getCenter()) */

    if(signupForm) {
        signupForm.addEventListener('submit', e => {
            e.preventDefault()
            /* const data = {
                handle: document.getElementById('input-handle').value,
                password: document.getElementById('input-password').value,
                passwordConfirm: document.getElementById('input-password-confirm').value,
                bio: document.getElementById('input-bio').value,
                location: {
                    coordinates: [ lat, lng ]
                }
            } */

            const form = new FormData()
            form.append('handle', document.getElementById('input-handle').value)
            form.append('password', document.getElementById('input-password').value)
            form.append('passwordConfirm', document.getElementById('input-password-confirm').value)
            form.append('bio', document.getElementById('input-bio').value)
            form.append('location', `${lat} ${lng}`)
            form.append('profilePic', document.getElementById('img-upload').files[0] || '/users/default.png')

            signup(form)
        })
    }
}

// POSTING

const postBtn = document.querySelector('.post-btn')
const postTextArea = document.querySelector('.post-input__textarea')

if(postBtn) {
    postBtn.addEventListener('click', () => {
        createPost(postTextArea.value)
    })
}

// LIKING POSTS

const likeBtns = document.querySelectorAll('.like-btn')

const likeBtnFn = (curr, e) => {
    const likesCount = e.target.nextSibling
    const postId = e.target.closest('.post').dataset.id

    if(curr.classList.contains('fa-regular')) {
        curr.classList.replace('fa-regular', 'fa-solid')
        likesCount.innerText = `${(likesCount.innerText*1) + 1}`

        if(!curr.classList.contains('comment-like'))
            likePost(postId, 'like')
        else
            likeComment(e.target.closest('.post').dataset.id, e.target.closest('.comment').dataset.id)
    }
    else {
        curr.classList.replace('fa-solid', 'fa-regular')
        likesCount.innerText = `${(likesCount.innerText*1) - 1}`
        
        if(!curr.classList.contains('comment-like'))
            likePost(postId, 'unlike')
        // else
            // console.log('comment')
    }
    
    curr.classList.toggle('liked')
}

if(likeBtns) {
    likeBtns.forEach(curr => {
        curr.addEventListener('click', e => {
            likeBtnFn(curr, e)
        })
    })
}

// CLICKING ON POSTS TO VIEW DETAILS

const commentsBtns = document.querySelectorAll('.comment-btn')

const commentBtnFn = e => {
    const postId = e.target.closest('.post').dataset.id

    location.href = `/${postId}/comments`
}

if(commentsBtns) {
    commentsBtns.forEach(curr => {
        curr.addEventListener('click', e => {
            commentBtnFn(e)
        })
    })
}

// POSTING COMMENTS

const makeCommentBtn = document.querySelector('.btn-comment')

if(makeCommentBtn) {
    makeCommentBtn.addEventListener('click', () => {
        const text = document.querySelector('.comment-input-text')
        const postId = document.querySelector('.main-post').dataset.id

        createComment(text.value, postId)

        text.value = ''
    })
}

// SEARCH

const searchBtn = document.querySelector('.search-icon')

if(searchBtn) {
    searchBtn.addEventListener('click', async () => {
        document.querySelector('.posts').innerHTML = ''
        const searchQuery = document.querySelector('.search').value
    
        const users = (await search(searchQuery)).data.data.users

        if(users.length === 0)
            document.querySelector('.posts').innerHTML += '<div class=\'no-posts\'><h3>No results :(</h3></div>'
        else {
            users.forEach(curr => {
                const html = `<figure class="post">
            
                    <div class="post__pfp-wrapper">
                        <figure class="post__pfp">
                            <a href="${'/' + curr.handle}"><img src="${'/img/' + curr.profilePic}" alt="Profile pic" class="pfp-img"></a>
                        </figure>
                    </div>

                    <!-- ALL THE OTHER PARTS -->

                    <div class="post__text-container">
                        <div class="post__content-top">
                            <h3 class="handle">${curr.handle}</h3>
                            ${curr.verified ? '<i class="fa-solid fa-circle-check verified"></i>' : ''}
                            <h3 class="follow">Follow</h3>
                        </div>
                        <div class="post__content-bottom">
                            <p class="post-text">
                                ${curr.bio}
                            </p>
                        </div>
                    </div>

                </figure>`

                document.querySelector('.posts').innerHTML += html
            })
        }

        document.querySelector('.search').value = ''
    })
}

// FUNCTION TO RENDER POSTS TO UI FOR EXPLORE PAGE
const renderPosts = async fn => {
    document.querySelector('.posts').innerHTML += '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>'

    const postsNear = (await fn()).data.data.posts
    let likesNear = (await getLikedPosts()).data.data.likes
    likesNear = likesNear.map(curr => curr.post)

    document.querySelector('.posts').innerHTML = ''

    postsNear.forEach(curr => {
        const html = `<figure class="post" data-id="${curr._id}">                
            <div class="post__pfp-wrapper">
                <figure class="post__pfp">
                    <a href="${'/' + curr.user.handle}"><img src="${'/img/' + curr.user.profilePic}" alt="Profile pic" class="pfp-img"></a>
                </figure>
            </div>

            <!-- ALL THE OTHER PARTS -->

            <div class="post__text-container">
                <div class="post__content-top">
                    <h3 class="handle">${curr.user.handle}</h3>
                    ${curr.user.verified ? '<i class="fa-solid fa-circle-check verified"></i>' : ''}
                    <p class="post-text-p">&bull;</p>
                    <p class="post-text-p">${new Date(curr.createdAt).toLocaleDateString('en-us')}</p>
                </div>
                <div class="post__content-bottom">
                    <p class="post-text">
                        ${curr.text}
                    </p>
                </div>
            </div>

            <div class="post__interactions">
                <div class="post__interactions__interaction-container">
                    ${likesNear.includes(curr._id) ? '<i class="fa-solid fa-heart liked"></i>' : '<i class="fa-regular fa-heart"></i>'}<p class="post-text-p">${curr.numLikes}</p>
                </div>
                <div class="post__interactions__interaction-container">
                    <i class="fa-regular fa-comment"></i>
                    <p class="post-text-p">${curr.numComments}</p>
                </div>
            </div>

            </figure>`

            const postContainer = document.querySelector('.posts')
            postContainer.innerHTML += html
        })

    document.querySelector('.posts').childNodes.forEach(curr => {
        curr.querySelector('.fa-heart').addEventListener('click', e => {
            likeBtnFn(curr.querySelector('.fa-heart'), e)
        })

        curr.querySelector('.fa-comment').addEventListener('click', e => {
            commentBtnFn(e)
        })
    })
}

// EXPLORE BAR

const exploreBtns = document.querySelectorAll('.explore-btn')

if(exploreBtns.length !== 0) {
    renderPosts(getPostsInArea)

    exploreBtns.forEach(curr => {
        curr.addEventListener('click', async e => {
            document.querySelector('.posts').innerHTML = ''

            exploreBtns.forEach(curr => curr.closest('div').classList.remove('type-slider__active'))
            e.target.closest('div').classList.add('type-slider__active')

            const selectedBtn = e.target.innerText
            
            switch(selectedBtn) {
                case 'Posts': 
                    renderPosts(getPostsInArea)
                    break
                case 'Following': 
                    renderPosts(getPostsFromFollowing)
                    break
                case 'People':
                    document.querySelector('.posts').innerHTML += '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>'
                    const people = (await getPeopleInArea()).data.data.users
                    document.querySelector('.posts').innerHTML = ''
                    
                    people.forEach(curr => {
                        const html = `<figure class="post">
                        
                                <div class="post__pfp-wrapper">
                                    <figure class="post__pfp">
                                        <a href="${'/' + curr.handle}"><img src="${'/img/' + curr.profilePic}" alt="Profile pic" class="pfp-img"></a>
                                    </figure>
                                </div>
            
                                <!-- ALL THE OTHER PARTS -->
            
                                <div class="post__text-container">
                                    <div class="post__content-top">
                                        <h3 class="handle">${curr.handle}</h3>
                                        ${curr.verified ? '<i class="fa-solid fa-circle-check verified"></i>' : ''}
                                    </div>
                                    <div class="post__content-bottom">
                                        <p class="post-text">
                                            ${curr.bio}
                                        </p>
                                    </div>
                                </div>
            
                            </figure>`
            
                        document.querySelector('.posts').innerHTML += html
                    })
                    break
            }
        })
    })
}

const followBtn = document.querySelector('.follow-btn')

if(followBtn) {
    followBtn.addEventListener('click', async () => {
        const btnText = followBtn.innerText.toLowerCase()
        
        if(btnText === 'follow') {
            const numFollowers = document.querySelector('.profile-header__data-num-followers a').innerText
            document.querySelector('.profile-header__data-num-followers a').innerText = `${numFollowers*1 + 1}`

            followBtn.innerText = 'Unfollow'

            const id = document.querySelector('.profile-info').dataset.id
            await handleFollowAction(id, btnText)
        }

        if(btnText === 'unfollow') {
            const numFollowers = document.querySelector('.profile-header__data-num-followers a').innerText
            document.querySelector('.profile-header__data-num-followers a').innerText = `${numFollowers*1 - 1}`

            followBtn.innerText = 'Follow'

            const id = document.querySelector('.profile-info').dataset.id
            await handleFollowAction(id, btnText)
        }
    })
}

const logoutBtn = document.querySelector('.logout-btn')

if(logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await logout()
    })
}