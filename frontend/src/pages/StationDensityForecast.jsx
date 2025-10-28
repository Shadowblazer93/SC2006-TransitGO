import React, { useEffect, useState } from 'react'
import { getStationCrowdDensityForecast } from '../services/api'

const LINES = ['CCL','CEL','CGL','DTL','EWL','NEL','NSL','BPL','SLRT','PLRT','TEL']
const LineDesc = ['Circle Line','Circle Line Extension : Marina Bay','Changi Extension','Downtown Line','East West Line','North East Line','North South Line','Bukit Panjang LRT','Sengkang LRT',' Punggol LRT','Thomson-East Coast Line']

export default function StationDensityForecast() {
  const [linesData, setLinesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedLine, setExpandedLine] = useState(null) // the expanded line
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError(null)
      try {
        const promises = LINES.map((line) =>
          getStationCrowdDensityForecast(line)
            .then((res) => ({ line, ok: true, payload: res }))
            .catch((err) => ({ line, ok: false, error: err }))
        )
        const results = await Promise.all(promises)
        console.log(results)

        const normalized = results.map((r) => {
          if (!r.ok) return { line: r.line, error: r.error?.message || String(r.error), stations: [], count: 0 }

          let payload = r.payload
          let stations = []
          if (Array.isArray(payload)) stations = payload
          else if (payload && Array.isArray(payload.value)) stations = payload.value
          else if (payload && Array.isArray(payload.results)) stations = payload.results
          else if (payload && Array.isArray(payload.data)) stations = payload.data
          else stations = []

          return { line: r.line, stations, count: stations.length }
        })

        setLinesData(normalized)
      } catch (e) {
        setError(e.message || String(e))
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const toggleLine = (line) => {
    setExpandedLine((cur) => (cur === line ? null : line))
  }

  const getStationLabel = (s) => s.StationCode ?? s.StationID ?? s.Station ?? s.StationName ?? '—'
  const getStationName = (s) => s.Station ?? 'Unknown station'
  const getDensity = (s) => s.CrowdLevel ?? 'N/A'

  const densityMap = (d) => {
    switch (d) {
      case 'l': return 'low';
      case 'm': return 'moderate';
      case 'h': return 'high';
      default: return 'NA';
    }
  }

  const densityColor = (mapped) => {
    switch (mapped) {
      case 'low': return '#afffb3ff'
      case 'moderate': return '#fff0acff'
      case 'high': return '#ff9f9fff'
      default: return '#ffffff'
    }
  }

  const normalizedSearch = (s) => (s || '').toString().trim().toLowerCase()
  const displayedLines = linesData.filter((lb) => {
    if (!searchText) return true
    const q = normalizedSearch(searchText)
    const codeMatch = normalizedSearch(lb.line).includes(q)
    const desc = LineDesc[LINES.indexOf(lb.line)] || ''
    const descMatch = normalizedSearch(desc).includes(q)
    return codeMatch || descMatch
  })

  if (loading) return <div style={{ padding: 16 }}>Loading station densities...</div>
  if (error) return <div style={{ padding: 16, color: 'red' }}>Error: {error}</div>

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      margin: '0 auto',
      paddingLeft: 10,
      paddingRight: 10,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      minHeight: '100vh',
      minWidth: '100vw',
      boxSizing: 'border-box'
    }}>
      {/* sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, marginBottom: 20, background:'#222', padding: '12px 10px' }}>
        <h1 style={{ fontSize: 20, marginBottom: 8, color: '#fff' }}>Forecasted Station Density</h1>
        <p style={{ marginTop: 0, marginBottom: 12, color: '#aaa' }}>Tap a line to view its stations.</p>

      {/* search bar */}
      <div style={{ marginBottom: 12 }}>
        <input
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search line code or description"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #000',
            fontSize: 14,
            boxSizing: 'border-box',
            background: '#111',
            color: '#fff',
            touchAction: 'manipulation'
          }}
        />
      </div>
    </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayedLines.map((lineBlock) => {
          const isOpen = expandedLine === lineBlock.line
          const estimatedHeight = 24 + lineBlock.stations.length * 72 // header + station rows
          const drawerMax = isOpen ? Math.min(estimatedHeight, 900) : 0

          return (
            <div key={lineBlock.line} style={{ borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <button
                onClick={() => toggleLine(lineBlock.line)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  background: isOpen ? '#f0f8ff' : '#a952ecff',
                  color: isOpen ? '#a952ecff' : '#fff',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: 16,
                  fontWeight: 700,
                  touchAction: 'manipulation',
                }}
                aria-expanded={isOpen}
              >
                <span>
                  {lineBlock.line} | 
                  <span style={{ fontSize: 12, paddingLeft: 5, fontWeight: 400}}>{LineDesc[LINES.indexOf(lineBlock.line)] || ''}</span>
                  </span>
                <span style={{ fontSize: 13, opacity: 0.95, paddingLeft: 10 }}>{lineBlock.count} stations</span>
              </button>

              <div
                style={{
                  padding: isOpen ? 12 : 0,
                  background: '#fafafa',
                  overflow: 'hidden',
                  maxHeight: drawerMax,
                  transition: 'max-height 320ms ease, opacity 220ms ease, transform 320ms ease, padding 220ms ease',
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? 'translateY(0px)' : 'translateY(-6px)',
                  pointerEvents: isOpen ? 'auto' : 'none'
                }}
                aria-hidden={!isOpen}
              >
                <span style={{ padding: 10, color: '#444', fontWeight: 700 }}>{LineDesc[LINES.indexOf(lineBlock.line)] || ''}</span>
                {lineBlock.error ? (
                  <div style={{ color: 'red', padding: 8 }}>{lineBlock.error}</div>
                ) : lineBlock.stations.length === 0 ? (
                  <div style={{ color: '#666', padding: 8 }}>No stations returned.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {lineBlock.stations.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => alert(`${getStationName(s)} — density: ${getDensity(s)}`)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          borderRadius: 10,
                          border: '1px solid #eee',
                          background: densityColor(densityMap(getDensity(s))),
                          fontSize: 14,
                          textAlign: 'left',
                          touchAction: 'manipulation',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ color: '#444', fontWeight: 700 }}>{getStationName(s)}</span>
                          <span style={{ fontSize: 12, color: '#666' }}>{getStationLabel(s)}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, color: '#666' }}>Density</div>
                          <div style={{ fontWeight: 500, color: '#444'}}>{densityMap(getDensity(s))}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {displayedLines.length === 0 && (
          <div style={{ padding: 12, color: '#666' }}>No lines match your search.</div>
        )}
      </div>
    </div>
  )
}