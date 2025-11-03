import React, { useEffect, useState } from 'react'
import { trainServiceAlerts } from '../services/api'
import { user_loggedin } from '../supabaseClient'
import FooterNav from '../components/FooterNav'

export default function TrainServiceAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchAlerts = async () => {
      setLoading(true)
      setError(null)
      try {

        // replaced with example response for now
        // because there are no service alerts
        // const res = await trainServiceAlerts()

        const res = [
          {
            "Status": 2,
            "Line": "NEL",
            "Direction": "towards HarbourFront",
            "Stations": "Serangoon; Woodleigh; Potong Pasir",
            "FreePublicBus": ["Serangoon Bus Interchange"],
            "FreeMRTShuttle": ["Woodleigh", "Potong Pasir"]
          },
          {
            "Status": 2,
            "Line": "EWL",
            "Direction": "towards Pasir Ris",
            "Stations": "Bugis; Lavender",
            "FreePublicBus": [],
            "FreeMRTShuttle": []
          },
          {
            "Status": 1,
            "Line": "DTL",
            "Direction": "towards Bukit Panjang",
            "Stations": "",
            "FreePublicBus": [],
            "FreeMRTShuttle": []
          }
        ]


        let items = []
        if (Array.isArray(res)) items = res
        else if (res && Array.isArray(res.value)) items = res.value
        else if (res && Array.isArray(res.data)) items = res.data
        else if (res && Array.isArray(res.results)) items = res.results

        const disrupted = items

        if (mounted) setAlerts(disrupted)
      } catch (e) {
        if (mounted) setError(e.message || String(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchAlerts()
    return () => {
      mounted = false
    }
  }, [])

  // authentication
  const [perms, setPerms] = useState(true)
  user_loggedin().then((res) => {if (!res) setPerms(false)})
  if (!perms) {return (<div style={{background:'#ffaeaeff', fontWeight:600, fontSize:15, padding: '20px 5px'}}>YOU DO NOT HAVE PERMISSION TO VIEW THIS PAGE</div>)}

  const statusMap = (s) => {
    switch (s) {
      case 1: return 'Normal';
      case 2: return 'Disrupted';
      default: return 'Unknown';
    }
  }

  const statusColor = (s) => {
    switch(s) {
      case 1: return '#75b657ff';
      case 2: return '#d05e5eff';
      default: return '#3e8ecbff'
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Loading alerts...</div>
  if (error) return <div style={{ padding: 16, color: 'red' }}>Error: {error}</div>
  if (!alerts.length) return <div style={{ padding: 16 }}>No current disruptions.</div>

  return (
    <div style={{ boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial' }}>
      <div style={{
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          background: '#eee',
          borderBottom: '3px solid #ddd',
          borderRadius: 20,
          zIndex: 999,
          boxSizing: 'border-box'
          }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 0px 0', textAlign: 'center' }}>Train Service Disruptions</h1>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 12,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {alerts.map((a, idx) => {
          const status = a.Status ?? 'Unkown'
          const line = a.Line ?? a.line ?? 'Unknown'
          const direction = a.Direction ?? a.direction ?? 'Unknown'
          const stations = a.Stations ?? a.stations ?? a.AffectedStations ?? ''
          const freePublicBus = a.FreePublicBus ?? a.freePublicBus ?? a.freepublicbus ?? []
          const freeMrtShuttle = a.FreeMRTShuttle ?? a.freeMrtShuttle ?? []

          const listToString = (v) => {
            if (!v) return '—'
            if (Array.isArray(v)) return v.join(', ')
            return String(v)
          }

          return (
            <div
              key={idx}
              style={{
                width: '95vw',
                marginLeft: '2.5vw',
                background: statusColor(status),
                border: `1px solid black`,
                borderRadius: 12,
                padding: 12,
                boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{line}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#fff3f3ff', padding: 8, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>Status</div>
                  <div style={{ fontWeight: 600, color: statusColor(status) }}>{statusMap(status)}</div>
                </div>

                <div style={{ background: '#fff3f3ff', padding: 8, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>Direction</div>
                  <div style={{ fontWeight: 400, color: '#000' }}>{direction || '—'}</div>
                </div>

                <div style={{ background: '#fff3f3ff', padding: 8, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>Affected Stations</div>
                  <div style={{ fontWeight: 400, color: '#000' }}>{stations || '—'}</div>
                </div>

                <div style={{ background: '#fff3f3ff', padding: 8, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>Free Public Bus</div>
                  <div style={{ fontWeight: 400, color: '#000' }}>{listToString(freePublicBus) || '—'}</div>
                </div>

                <div style={{ background: '#fff3f3ff', padding: 8, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>Free MRT Shuttle</div>
                  <div style={{ fontWeight: 400, color: '#000' }}>{listToString(freeMrtShuttle) || '—'}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <FooterNav />
    </div>
  )
}