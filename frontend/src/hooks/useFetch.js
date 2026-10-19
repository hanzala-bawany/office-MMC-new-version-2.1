import { useState, useEffect } from "react"
import axiosInstance from "../utills/axiosInstance"
import { toast } from "react-toastify"

const useFetch = (url, params = {}) => {

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const fetchData = async (overrideParams) => {

        if (!url) return

        setLoading(true)
        setError(false)
        try {
            const res = await axiosInstance.get(url, {
                params: overrideParams ?? params,
            })
            // const res = await axiosInstance.get(url)
            setData(res?.data)
            // toast.success(res?.data?.message)
            
        }
        catch (error) {
            setError(error?.response?.message)
            console.log(error , "err .............");
            
        }
        finally {
            setLoading(false)
        }
        
    }

    useEffect(() => {
        fetchData()
    }, [url, JSON.stringify(params)])

    return { data, loading, error, reFetchData: fetchData }
}

export default useFetch


// Method	Signature	2nd argument	3rd argument
// GET	axios.get(url, config)	config object	— (hota hi nahi)
// DELETE	axios.delete(url, config)	config object	—
// POST	axios.post(url, data, config)	body data	config object
// PUT	axios.put(url, data, config)	body data	config object
// PATCH	axios.patch(url, data, config)	body data	config object




// axiosInstance.get(url, {
//     params: { facultyId: 3 },          // query string: ?facultyId=3 → backend req.query
//     headers: { Authorization: 'Bearer token' },  // custom headers → backend req.headers
//     withCredentials: true,             // cookies/session bhejni hain to
//     timeout: 5000,                     // 5 sec ke baad request cancel, ELSE default no timeout
//     responseType: 'json',              // 'json' | 'blob' | 'arraybuffer' | 'text' (file download etc ke liye)
//     signal: abortController.signal,    // request cancel karne ke liye (AbortController)
//     data: {...},                       // GET me rarely, POST/PUT me yahan nahi jata (wo 2nd arg me jata hai)