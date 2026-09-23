import axios, { create } from 'axios'

const apilocal = axios.create({
    baseURL:"http://localhost:3333"
})

export default apilocal