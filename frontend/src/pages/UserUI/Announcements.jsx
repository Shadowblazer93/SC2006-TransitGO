import React, { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function AnnouncementView() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchAnnouncements = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('id, title, message, created_time, author')
          .order('created_time', { ascending: false })

        if (error) throw error
        if (mounted) setAnnouncements(Array.isArray(data) ? data : [])
      } catch (err) {
        if (mounted) setError(err?.message ?? String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchAnnouncements()
    return () => {
      mounted = false
    }
  }, [])

  const fmtTime = (t) => {
    if (!t) return 'Unknown'
    try {
      const d = new Date(t)
      return isNaN(d.getTime()) ? String(t) : d.toLocaleString()
    } catch {
      return String(t)
    }
  }

  const getRandomColor = () => {
    const pastelColors = [
      '#FAD9E8',
      '#DFF7E4',
      '#E6F0FF',
      '#FFF4D9',
      '#FDEBD9',
      '#F5E8FF',
      '#E8FFF4',
      '#FFECEC',
      '#F0FFF5',
      '#FFF1F0',
      '#FCF8E8',
      '#EAF6FF'
    ]
    return pastelColors[Math.floor(Math.random() * pastelColors.length)]
  }

  if (loading) return <div style={{ padding: 16 }}>Loading announcements...</div>
  if (error) return <div style={{ padding: 16, color: 'red' }}>Error: {error}</div>
  if (!announcements.length) return <div style={{ padding: 16 }}>No announcements.</div>

  return (
    <div style={{
      width: '100vw',
      padding: 12,
      paddingTop: 72,
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      minHeight: '100vh'
    }}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 54,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          background: '#ddd',
          borderBottom: '2px solid #aaa',
          zIndex: 999,
          boxSizing: 'border-box'
        }}
      >
        <h1 style={{ fontSize: 25, margin: 0 }}>Announcements</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {announcements.map((a) => (
          <div key={a.id} style={{ background: getRandomColor(), border: '1px solid #999', borderRadius: 10, padding: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.04)' }}>
            {a.title && <div style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>{a.title}</div>}
            <div style={{ marginBottom: 8, whiteSpace: 'pre-wrap', color: '#111' }}>{a.message}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', fontSize: 13, color: '#666' }}>
              <div style={{ fontWeight: 600 }}>{a.author ?? 'Unknown'}</div>
              <div>{fmtTime(a.created_time)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}