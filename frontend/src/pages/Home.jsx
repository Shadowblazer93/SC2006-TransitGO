import React, { useEffect, useState } from 'react'
import axios from 'axios'

function Home() {
  const [busStops, setBusStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBusStops = async () => {
      try {
        // Ensure trailing slash to match Django URLs
        const url = `${import.meta.env.VITE_API_BASE_URL}/api/busstops/`
        const res = await axios.get(url)
        console.log('API response:', res.data)

        if (Array.isArray(res.data)) {
          setBusStops(res.data)
        } else if (res.data.detail) {
          // Handle DRF "Not Found" or other messages
          setError(res.data.detail)
        } else {
          setBusStops([])
          console.warn('Unexpected API response shape', res.data)
        }
      } catch (err) {
        console.error(err)
        if (err.response) {
          // Server responded with a status code outside 2xx
          setError(`Error ${err.response.status}: ${err.response.data?.detail || 'Server error'}`)
        } else if (err.request) {
          // Request was made but no response
          setError('No response from server. Is backend running?')
        } else {
          setError('Error: ' + err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBusStops()
  }, [])

  if (loading) return <p>Loading bus stops...</p>
  if (error) return <p>{error}</p>
  if (!busStops.length) return <p>No bus stops available.</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Mobile App</h1>
      <h2>Bus Stops (first 10):</h2>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Bus Stop Code</th>
            <th>Description</th>
            <th>Road Name</th>
          </tr>
        </thead>
        <tbody>
          {busStops.slice(0, 10).map((stop) => (
            <tr key={stop.BusStopCode}>
              <td>{stop.BusStopCode}</td>
              <td>{stop.Description}</td>
              <td>{stop.RoadName || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Home


